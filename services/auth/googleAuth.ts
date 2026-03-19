import { API_ENDPOINTS, Api } from "@/services/api/endpoints";
import {
  UserStorage,
  getAuthToken as getLoginToken,
  type User as LoginUser,
} from "@/services/auth/login";
import { saveAuthToken } from "@/utils/auth";

export type Nationality = "Egyptian" | "Other";

export interface GoogleAuthUser {
  _id: string;
  email: string;
  isVerified: boolean;
  phoneNumber: string | null;
  nationality: Nationality;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface ProfileCompletion {
  phoneNumber: boolean;
  nationality: boolean;
}

export interface GoogleSignupResponse {
  status: "success";
  data: {
    user: GoogleAuthUser;
    token: string;
    isNewUser: boolean;
    isVerified: boolean;
    profileCompletion: ProfileCompletion;
    needsProfileCompletion: boolean;
  };
}

export interface UpdateProfileResponse {
  status: "success";
  user: GoogleAuthUser;
}

export interface BackendFieldError {
  field: string;
  message: string;
}

interface ErrorApiResponse {
  status?: string;
  message?: string;
  error?: string;
  errors?: BackendFieldError[];
}

interface GoogleClientIdApiResponse {
  clientId?: string;
  message?: string;
}

export class AuthApiError extends Error {
  public statusCode?: number;
  public fieldErrors: Record<string, string>;
  public isNetworkError: boolean;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      fieldErrors?: Record<string, string>;
      isNetworkError?: boolean;
    }
  ) {
    super(message);
    this.name = "AuthApiError";
    this.statusCode = options?.statusCode;
    this.fieldErrors = options?.fieldErrors ?? {};
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface PromptMomentNotification {
  isNotDisplayed: () => boolean;
  getNotDisplayedReason?: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason?: () => string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: (listener?: (notification: PromptMomentNotification) => void) => void;
  cancel?: () => void;
}

interface GoogleWindow {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleWindow;
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-services-script";
const REQUEST_TIMEOUT_MS = 45_000;
const GOOGLE_SCRIPT_LOAD_TIMEOUT_MS = 15_000;
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const AUTH_TOKEN_KEY = "auth_token";
const LEGACY_TOKEN_KEY = "authToken";

let googleScriptPromise: Promise<void> | null = null;
let googleClientIdPromise: Promise<string> | null = null;

const parseJsonSafe = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const normalizeFieldErrors = (errors?: BackendFieldError[]): Record<string, string> => {
  if (!Array.isArray(errors)) return {};

  return errors.reduce<Record<string, string>>((acc, current) => {
    if (!current?.field || !current?.message) return acc;
    acc[current.field] = current.message;
    return acc;
  }, {});
};

const resolveErrorMessage = (
  fallback: string,
  payload?: ErrorApiResponse | null,
  statusCode?: number
): string => {
  const directMessage =
    (typeof payload?.message === "string" && payload.message.trim())
      ? payload.message.trim()
      : (typeof payload?.error === "string" && payload.error.trim())
        ? payload.error.trim()
        : "";

  if (directMessage) {
    return directMessage;
  }

  const firstErrorMessage = payload?.errors?.find((item) => item?.message?.trim())?.message;
  if (firstErrorMessage) {
    return firstErrorMessage.trim();
  }

  if (statusCode && statusCode >= 400) {
    return `${fallback} (HTTP ${statusCode})`;
  }

  return fallback;
};

const toStorageUser = (user: GoogleAuthUser): LoginUser => {
  const role = typeof user.role === "string" ? user.role : undefined;
  const image =
    typeof user.image === "string" || user.image === null
      ? user.image
      : undefined;

  return {
    _id: user._id,
    id: user._id,
    firstName: typeof user.firstName === "string" ? user.firstName : "",
    lastName: typeof user.lastName === "string" ? user.lastName : "",
    email: user.email,
    role,
    image,
    phoneNumber: user.phoneNumber ?? "",
    isVerified: user.isVerified,
    isEmailVerified: true,
  };
};

const saveAuthSession = (token: string, user: GoogleAuthUser) => {
  UserStorage.saveToken(token);
  UserStorage.saveUser(toStorageUser(user));
  saveAuthToken(token);

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    localStorage.setItem("user_data", JSON.stringify(user));
  }
};

const getRawStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const raw =
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    localStorage.getItem(LEGACY_TOKEN_KEY) ??
    null;

  const normalized = raw?.trim();
  return normalized ? normalized : null;
};

const getTokenOrThrow = (explicitToken?: string): string => {
  const direct = explicitToken?.trim();
  const tokenFromAuthService = getLoginToken();
  const fallbackRawToken = getRawStoredToken();

  const token = direct || tokenFromAuthService || fallbackRawToken;

  if (!token) {
    throw new AuthApiError("جلسة تسجيل الدخول غير صالحة. يرجى تسجيل الدخول مرة أخرى.", {
      statusCode: 401,
    });
  }

  // If we only have a raw token (without login service metadata), normalize it
  // into the shared auth storage so next reads stay consistent.
  if (!tokenFromAuthService && fallbackRawToken && typeof window !== "undefined") {
    UserStorage.saveToken(token);
  }

  return token;
};

export const getGoogleClientId = async (): Promise<string> => {
  const clientIdFromEnv = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  if (clientIdFromEnv) {
    return clientIdFromEnv;
  }

  if (typeof window === "undefined") {
    throw new AuthApiError("Google Client ID is missing. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
  }

  if (!googleClientIdPromise) {
    googleClientIdPromise = (async () => {
      try {
        const response = await fetch("/api/config/google-client-id", {
          method: "GET",
          cache: "no-store",
        });

        const payload = await parseJsonSafe<GoogleClientIdApiResponse>(response);

        if (!response.ok) {
          throw new AuthApiError(
            resolveErrorMessage(
              "تعذر تحميل إعدادات Google. يرجى المحاولة مرة أخرى.",
              {
                message: payload?.message,
              },
              response.status
            ),
            {
              statusCode: response.status,
            }
          );
        }

        const clientId = payload?.clientId?.trim() ?? "";
        if (!clientId) {
          throw new AuthApiError("إعدادات Google غير مكتملة. يرجى التواصل مع الدعم.");
        }

        return clientId;
      } catch (error) {
        googleClientIdPromise = null;

        if (error instanceof AuthApiError) {
          throw error;
        }

        throw new AuthApiError("تعذر تحميل إعدادات Google. يرجى التحقق من الاتصال والمحاولة مرة أخرى.", {
          isNetworkError: true,
        });
      }
    })();
  }

  return googleClientIdPromise;
};

export const loadGoogleIdentityScript = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  if (window.google?.accounts?.id) {
    return;
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const finalizeReject = (message: string) => {
      googleScriptPromise = null;
      reject(new Error(message));
    };

    const timeoutId = window.setTimeout(() => {
      finalizeReject("Google script load timeout");
    }, GOOGLE_SCRIPT_LOAD_TIMEOUT_MS);

    const onLoaded = () => {
      window.clearTimeout(timeoutId);

      if (!window.google?.accounts?.id) {
        finalizeReject("Google script loaded without Google Identity API");
        return;
      }

      resolve();
    };

    const onScriptError = () => {
      window.clearTimeout(timeoutId);
      finalizeReject("Failed to load Google script");
    };

    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      // If an existing script already finished and API is available, resolve immediately.
      if (window.google?.accounts?.id) {
        window.clearTimeout(timeoutId);
        resolve();
        return;
      }

      const loadFinished =
        existing.dataset.gisLoaded === "true" || existing.dataset.gisFailed === "true";

      // Retry from scratch when a stale or previously failed script element exists.
      if (loadFinished) {
        existing.remove();
      } else {
        existing.addEventListener("load", onLoaded, { once: true });
        existing.addEventListener("error", onScriptError, { once: true });
        return;
      }
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.gisLoaded = "true";
      onLoaded();
    };
    script.onerror = () => {
      script.dataset.gisFailed = "true";
      onScriptError();
    };

    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export const requestGoogleIdToken = async (clientId: string): Promise<string> => {
  if (!clientId.trim()) {
    throw new AuthApiError("Google Client ID is missing. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
  }

  try {
    await loadGoogleIdentityScript();
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to load Google script";

    const isLoadFailure =
      message.includes("Failed to load Google script") ||
      message.includes("Google script load timeout") ||
      message.includes("Google Identity API");

    if (isLoadFailure) {
      throw new AuthApiError(
        "تعذر تحميل خدمة Google. تأكد من الاتصال بالإنترنت، وأوقف مانع الإعلانات، ثم أعد المحاولة."
      );
    }

    throw error instanceof AuthApiError
      ? error
      : new AuthApiError("حدث خطأ أثناء بدء تسجيل الدخول عبر Google.");
  }

  if (!window.google?.accounts?.id) {
    throw new AuthApiError("تعذر تحميل خدمة Google. يرجى المحاولة مرة أخرى.");
  }

  const googleIdentity = window.google.accounts.id;

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    const finalize = (handler: () => void) => {
      if (settled) return;
      settled = true;
      handler();
    };

    const timeoutId = window.setTimeout(() => {
      finalize(() => reject(new AuthApiError("انتهت مهلة تسجيل الدخول عبر Google. حاول مرة أخرى.")));
    }, REQUEST_TIMEOUT_MS);

    try {
      googleIdentity.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
        callback: (response) => {
          window.clearTimeout(timeoutId);

          if (!response?.credential) {
            finalize(() =>
              reject(new AuthApiError("لم يتم استلام رمز التحقق من Google. يرجى إعادة المحاولة."))
            );
            return;
          }

          finalize(() => resolve(response.credential as string));
        },
      });

      googleIdentity.prompt((notification) => {
        if (settled) return;

        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason?.() ?? "unknown";
          window.clearTimeout(timeoutId);
          finalize(() =>
            reject(
              new AuthApiError(
                `تعذر عرض نافذة Google (${reason}). يرجى التأكد من تعطيل مانع النوافذ المنبثقة.`
              )
            )
          );
          return;
        }

        if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason?.() ?? "cancelled";
          window.clearTimeout(timeoutId);
          finalize(() =>
            reject(new AuthApiError(`تم إلغاء تسجيل الدخول عبر Google (${reason}).`))
          );
        }
      });
    } catch (error) {
      window.clearTimeout(timeoutId);
      finalize(() => {
        reject(
          error instanceof AuthApiError
            ? error
            : new AuthApiError("حدث خطأ أثناء بدء تسجيل الدخول عبر Google.")
        );
      });
    }
  });
};

export const signupWithGoogle = async (idToken: string): Promise<GoogleSignupResponse> => {
  try {
    const response = await fetch(`${Api}${API_ENDPOINTS.AUTH.SIGNUP_WITH_GOOGLE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        idToken,
        provider: "google",
      }),
    });

    const payload = await parseJsonSafe<GoogleSignupResponse | ErrorApiResponse>(response);

    if (process.env.NODE_ENV !== "production") {
      console.log("[GoogleAuth] signupWithGoogle response", {
        status: response.status,
        ok: response.ok,
        payload,
      });
    }

    if (!response.ok) {
      const typedError = payload as ErrorApiResponse | null;
      throw new AuthApiError(
        resolveErrorMessage(
          "فشل تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.",
          typedError,
          response.status
        ),
        {
          statusCode: response.status,
          fieldErrors: normalizeFieldErrors(typedError?.errors),
        }
      );
    }

    const data = payload as GoogleSignupResponse;

    if (!data?.data?.token || !data?.data?.user) {
      throw new AuthApiError("استجابة الخادم غير مكتملة. يرجى المحاولة مرة أخرى.");
    }

    if (!data.data.user.email) {
      throw new AuthApiError("لم يتم توفير بريد إلكتروني من Google. استخدم طريقة تسجيل مختلفة.");
    }

    saveAuthSession(data.data.token, data.data.user);

    return data;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError("تعذر الاتصال بالخادم. يرجى التحقق من الإنترنت والمحاولة مجددا.", {
      isNetworkError: true,
    });
  }
};

export const updatePhoneNumber = async (
  phoneNumber: string,
  nationality: Nationality,
  explicitToken?: string
): Promise<UpdateProfileResponse> => {
  const token = getTokenOrThrow(explicitToken);

  try {
    const response = await fetch(`${Api}${API_ENDPOINTS.AUTH.UPDATE_PROFILE}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phoneNumber, nationality }),
    });

    const payload = await parseJsonSafe<UpdateProfileResponse | ErrorApiResponse>(response);

    if (process.env.NODE_ENV !== "production") {
      console.log("[GoogleAuth] updatePhoneNumber response", {
        status: response.status,
        ok: response.ok,
        payload,
      });
    }

    if (!response.ok) {
      const typedError = payload as ErrorApiResponse | null;
      throw new AuthApiError(
        resolveErrorMessage(
          "تعذر تحديث الملف الشخصي. حاول مرة أخرى.",
          typedError,
          response.status
        ),
        {
          statusCode: response.status,
          fieldErrors: normalizeFieldErrors(typedError?.errors),
        }
      );
    }

    const data = payload as UpdateProfileResponse;

    if (!data?.user) {
      throw new AuthApiError("استجابة تحديث الملف الشخصي غير صحيحة.");
    }

    const storedUser = UserStorage.getUser();
    const mergedUser = {
      ...(storedUser ?? {}),
      ...data.user,
      isVerified: true,
    } as GoogleAuthUser;

    UserStorage.saveUser(toStorageUser(mergedUser));
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(mergedUser));
    }

    return {
      ...data,
      user: mergedUser,
    };
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError("تعذر الاتصال بالخادم. يرجى التحقق من الإنترنت والمحاولة مجددا.", {
      isNetworkError: true,
    });
  }
};
