// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { socialLogin } from "@/services/auth/login";
import { getPolicyAcceptanceInfo } from "@/utils/policyConsent";

export const runtime = "nodejs";

type BackendUser = {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  policyAccepted?: boolean;
  policyAcceptedAt?: string | null;
  [key: string]: unknown;
};

const debugLog = (...args: unknown[]) => {
  if (process.env.NEXTAUTH_DEBUG === "true") {
    console.log(...args);
  }
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    provider?: string;
    backendToken?: string;
    policyAccepted?: boolean;
    policyAcceptedAt?: string | null;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      backendUser?: BackendUser;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    provider?: string;
    backendToken?: string;
    policyAccepted?: boolean;
    policyAcceptedAt?: string | null;
    backendUser?: BackendUser;
  }
}

const normalizeBackendUser = (value: unknown): BackendUser | null => {
  if (!value || typeof value !== "object") return null;
  return value as BackendUser;
};

async function loginWithBackend(
  accessToken: string,
  provider: "google" | "facebook"
): Promise<{ success: boolean; token?: string; user?: BackendUser; error?: string }> {
  try {
    debugLog('🔄 [NextAuth] Calling backend with access token...');
    debugLog('🔑 [NextAuth] Provider:', provider);
    
    const response = await socialLogin({ 
      idToken: accessToken, 
      provider 
    });

    debugLog('📥 [NextAuth] Backend response:', response);

    if (response.status === 'success') {
      debugLog('✅ [NextAuth] Backend login successful');
      
      const normalizedUser = normalizeBackendUser(response.data.user) || undefined;
      return {
        success: true,
        token: response.data.token,
        user: normalizedUser
      };
    } else {
      console.error('❌ [NextAuth] Backend login failed:', response);
      return {
        success: false,
        error: response.message || 'Backend authentication failed'
      };
    }
  } catch (error: unknown) {
    console.error('❌ [NextAuth] Error calling backend:', error);
    const rawMessage =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";
    const normalized = rawMessage.toLowerCase();
    const safeMessage = normalized.includes('<html') || normalized.includes('application error')
      ? 'الخادم غير متاح حاليا. يرجى المحاولة مرة أخرى لاحقا.'
      : rawMessage || 'Failed to connect to backend';
    return {
      success: false,
      error: safeMessage
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
    verifyRequest: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account }) {
      debugLog('🎯 [NextAuth JWT Callback] Starting...');
      
      try {
        if (account) {
          debugLog('🔑 [NextAuth] New OAuth login detected');
          debugLog('🔑 [NextAuth] Provider:', account.provider);
          
          token.provider = account.provider;
          
          // Get the appropriate token
          let tokenToSend = account.access_token;
          
          if (account.provider === 'google' && account.id_token) {
            tokenToSend = account.id_token;
            debugLog('🔑 [NextAuth] Using Google ID token');
          } else {
            debugLog('🔑 [NextAuth] Using access token');
          }
          
          if (!tokenToSend) {
            console.error('❌ [NextAuth] No token available from provider');
            token.error = 'No authentication token received from provider';
            return token;
          }
          
          // DON'T store the OAuth token - we don't need it
          // token.accessToken = tokenToSend;
          
          // Call backend
          debugLog('📞 [NextAuth] Calling backend...');
          const backendResult = await loginWithBackend(
            tokenToSend,
            account.provider as 'google' | 'facebook'
          );
          
          if (backendResult.success) {
            token.backendToken = backendResult.token;

            const backendUser = normalizeBackendUser(backendResult.user);

            const policyInfo = getPolicyAcceptanceInfo(backendUser ?? {});
            token.policyAccepted = policyInfo.accepted;
            token.policyAcceptedAt = policyInfo.acceptedAt ?? null;
            
            token.backendUser = {
              id: backendUser?.id,
              email: backendUser?.email,
              name: backendUser?.name,
              phone: backendUser?.phone,
              policyAccepted: policyInfo.accepted,
              policyAcceptedAt: policyInfo.acceptedAt ?? null,
            };
            
            debugLog('✅ [NextAuth] Backend authentication successful');
            debugLog('👤 [NextAuth] User ID:', token.backendUser.id);
          } else {
            console.error('❌ [NextAuth] Backend authentication failed:', backendResult.error);
            token.error = backendResult.error || 'Backend authentication failed';
          }
        }
      } catch (error: unknown) {
        console.error('❌ [NextAuth] JWT callback error:', error);
        token.error =
          typeof error === "object" && error && "message" in error
            ? String((error as { message?: unknown }).message ?? "Authentication error occurred")
            : 'Authentication error occurred';
      }
      
      return token;
    },
    
    async session({ session, token }) {
      debugLog('🔄 [NextAuth Session Callback] Building session...');
      
      if (token.provider) {
        session.provider = token.provider as string;
      }
      
      if (token.backendToken) {
        session.backendToken = token.backendToken as string;
        debugLog('✅ [NextAuth] Backend token added to session');
      }

      if (typeof token.policyAccepted === 'boolean') {
        session.policyAccepted = token.policyAccepted;
        session.policyAcceptedAt = token.policyAcceptedAt ?? null;
      }
      
      // Add backend user data to session
      if (token.backendUser && session.user) {
        session.user.backendUser = token.backendUser;
        debugLog('✅ [NextAuth] Backend user added to session');
      }
      
      // Pass error to session if exists
      if (token.error) {
        (session as { error?: string }).error = String(token.error);
        console.error('⚠️ [NextAuth] Passing error to session:', token.error);
      }

      debugLog('📦 [NextAuth] Session ready:', {
        hasBackendToken: !!session.backendToken,
        hasBackendUser: !!session.user?.backendUser,
        hasError: !!(session as { error?: string }).error,
        userId: session.user?.backendUser?.id
      });
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      debugLog('🔄 [NextAuth Redirect Callback]');
      debugLog('📍 [NextAuth] URL:', url);
      debugLog('📍 [NextAuth] Base URL:', baseUrl);

      // Clean up legacy OAuth callback urls that were used by old login flow.
      if (url.includes("oauth=success") || url.includes("oauth=callback")) {
        return baseUrl;
      }

      // Keep explicit error redirects untouched so UI can display them.
      if (url.includes('error=')) {
        return url;
      }

      // Support relative callback URLs.
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Allow same-origin absolute callback URLs.
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return url;
        }
      } catch {
        // Fall through to the safe default.
      }

      // Fallback: keep users on the app root.
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
};

const handler = NextAuth(authOptions);

const safeHandler = async (
  request: Request,
  context: any
) => {
  try {
    return await handler(request, context);
  } catch (error) {
    console.error("❌ [NextAuth] Route handler failed:", error);
    return Response.json(
      { error: "Authentication service temporarily unavailable" },
      { status: 500 }
    );
  }
};

export { safeHandler as GET, safeHandler as POST };