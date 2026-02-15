"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession, getSession } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './../../../components/UI/Buttons/Button'; 
import Input from './../../../components/UI/Inputs/Input'; 
import Logo from '@/public/logo/logo2.png';
import Background from './../../../components/UI/Background/Background';
import Alert from '@/components/UI/Alert/alert';
import styles from './../auth.module.css';
import { AuthService, AuthError, LoginCredentials, UserStorage, type User } from './../../../services/auth/login';
import { hasAcceptedPolicies } from '@/utils/policyConsent';

interface PendingAuthData {
  token: string;
  user: Record<string, unknown>;
}

const PENDING_AUTH_KEY = 'policy_pending_auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const[ allowAutoLogin, setAllowAutoLogin ] = useState(() => {
    // Initialize from sessionStorage to persist across OAuth redirects
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('oauth_initiated') === 'true';
    }
    return false;
  });

  const normalizeUserRecord = (user: unknown): Record<string, unknown> => {
    if (user && typeof user === 'object') {
      return user as Record<string, unknown>;
    }
    return {};
  };

  const hasLocalPolicyAcceptance = (): boolean => {
    if (typeof window === 'undefined') return false;
    const flag = localStorage.getItem('policy_accepted');
    if (flag === 'true') return true;
    const storedUser = localStorage.getItem('user_data');
    if (!storedUser) return false;
    try {
      const user = JSON.parse(storedUser) as Record<string, unknown>;
      return hasAcceptedPolicies(user);
    } catch {
      return false;
    }
  };

  const storePendingAuth = (token: string, user: Record<string, unknown>) => {
    const payload: PendingAuthData = { token, user };
    sessionStorage.setItem(PENDING_AUTH_KEY, JSON.stringify(payload));
  };
// Complete fixed useEffect for OAuth handling in your LoginForm component

useEffect(() => {
  const handleSocialAuth = async () => {
    // Check if user just logged out
    const justLoggedOut = sessionStorage.getItem('user_logged_out');
    if (justLoggedOut) {
      console.log('🚪 [LoginForm] User just logged out, skipping auto-login');
      sessionStorage.removeItem('user_logged_out');
      return;
    }

    // Check for OAuth success parameter
    const isOAuthCallback = searchParams?.get('oauth') === 'success';
    
    console.log('🔍 [LoginForm] OAuth check:', {
      isOAuthCallback,
      status,
      hasSession: !!session
    });
    
    // Check existing localStorage token FIRST
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    const storedExpiry = localStorage.getItem('token_expiry');
    
    if (storedToken && storedUser && storedExpiry) {
      const isValid = Date.now() < parseInt(storedExpiry, 10);
      if (isValid) {
        console.log('✅ [LoginForm] Valid token found, redirecting...');
        router.push('/');
        return;
      } else {
        console.log('⚠️ [LoginForm] Token expired, clearing...');
        UserStorage.removeUser();
      }
    }
    
    // Only process OAuth callback if we're coming from OAuth flow
    if (!isOAuthCallback) {
      return;
    }

    // Guard: only handle OAuth when user initiated social login
    if (!allowAutoLogin) {
      console.warn('⚠️ [LoginForm] OAuth callback without user initiation, clearing URL');
      sessionStorage.removeItem('oauth_initiated');
      setIsLoading(false);
      router.replace('/login');
      return;
    }

    console.log('🔍 [LoginForm] Processing OAuth callback...');
    setIsLoading(true);
    
    // Wait for session to be fully loaded
    if (status === 'loading') {
      console.log('⏳ [LoginForm] Session loading, waiting...');
      return;
    }

    // 🔥 CRITICAL FIX: Force session refresh if unauthenticated
    if (status === 'unauthenticated') {
      console.log('⚠️ [LoginForm] Session unauthenticated, forcing refresh...');
      
      try {
        console.log('🔄 [LoginForm] Manually fetching session...');
        const freshSession = await getSession();
        
        console.log('📦 [LoginForm] Fresh session:', {
          hasSession: !!freshSession,
          hasBackendToken: !!freshSession?.backendToken,
          hasBackendUser: !!freshSession?.user?.backendUser,
          error: (freshSession as any)?.error
        });
        
        if (allowAutoLogin && freshSession?.backendToken && freshSession?.user?.backendUser) {
          const backendUserRecord = normalizeUserRecord(freshSession.user.backendUser);
          if (!hasAcceptedPolicies(backendUserRecord) && !hasLocalPolicyAcceptance()) {
            storePendingAuth(freshSession.backendToken, backendUserRecord);
            sessionStorage.removeItem('oauth_initiated');
            setAllowAutoLogin(false);
            setIsLoading(false);
            router.push('/accept-policies');
            return;
          }
          console.log('✅ [LoginForm] Fresh session has required data!');
          
          // Check for session error
          if ((freshSession as any)?.error) {
            console.error('❌ [LoginForm] Session has error:', (freshSession as any).error);
            setAlertMessage('فشل تسجيل الدخول: ' + (freshSession as any).error);
            setShowErrorAlert(true);
            setIsLoading(false);
            return;
          }
          
          try {
            // Save to localStorage
            console.log('💾 [LoginForm] Saving to localStorage...');
            UserStorage.saveUser(freshSession.user.backendUser as unknown as User);
            UserStorage.saveToken(freshSession.backendToken);
            
            // Verify save
            const savedUser = localStorage.getItem('user_data');
            const savedToken = localStorage.getItem('auth_token');
            
            if (savedUser && savedToken) {
              console.log('✅ [LoginForm] localStorage save successful!');
              console.log('👤 [LoginForm] User:', JSON.parse(savedUser)?.name);
              
              // Dispatch auth event
              window.dispatchEvent(new CustomEvent('authUpdated'));
              
              // Start token monitoring
              AuthService.startTokenMonitoring(() => {
                console.log('🔒 [LoginForm] Token expired');
                router.push('/login');
              });
              
              // Small delay then redirect
              await new Promise(resolve => setTimeout(resolve, 300));
              console.log('🚀 [LoginForm] Redirecting to dashboard...');
              sessionStorage.removeItem('oauth_initiated');
              router.push('/');
              return;
            } else {
              console.error('❌ [LoginForm] localStorage save FAILED!');
              setAlertMessage('فشل في حفظ بيانات تسجيل الدخول');
              setShowErrorAlert(true);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('❌ [LoginForm] Error saving to localStorage:', error);
            setAlertMessage('حدث خطأ في حفظ البيانات');
            setShowErrorAlert(true);
            setIsLoading(false);
            
            return;
          }
        } else {
          console.warn('⚠️ [LoginForm] Fresh session missing data after manual fetch');
          sessionStorage.removeItem('oauth_initiated');
          setAllowAutoLogin(false);
          setIsLoading(false);

          // Clean up the URL and reset login state
          router.replace('/login');
          return;
        }
      } catch (error) {
        console.error('❌ [LoginForm] Error fetching session:', error);
        setAlertMessage('حدث خطأ في تسجيل الدخول');
        setShowErrorAlert(true);
        setIsLoading(false);
        return;
      }
    }
    
    // Handle authenticated session from useSession hook
    if (status === 'authenticated') {
      console.log('✅ [LoginForm] Session authenticated via hook');
      
      // Check for session error
      if ((session as any)?.error) {
        console.error('❌ [LoginForm] Session has error:', (session as any).error);
        setAlertMessage('فشل تسجيل الدخول: ' + (session as any).error);
        setShowErrorAlert(true);
        setIsLoading(false);
        return;
      }
      
      // Check if we have the required data
      if (session?.backendToken && session?.user?.backendUser) {
        const backendUserRecord = normalizeUserRecord(session.user.backendUser);
        if (!hasAcceptedPolicies(backendUserRecord) && !hasLocalPolicyAcceptance()) {
          storePendingAuth(session.backendToken, backendUserRecord);
          sessionStorage.removeItem('oauth_initiated');
          setAllowAutoLogin(false);
          setIsLoading(false);
          router.push('/accept-policies');
          return;
        }
        console.log('✅ [LoginForm] Session has required data');
        
        try {
          // Save to localStorage
          console.log('💾 [LoginForm] Saving to localStorage...');
          UserStorage.saveUser(session.user.backendUser as unknown as User);
          UserStorage.saveToken(session.backendToken);
          
          // Verify save
          const savedUser = localStorage.getItem('user_data');
          const savedToken = localStorage.getItem('auth_token');
          
          if (savedUser && savedToken) {
            console.log('✅ [LoginForm] localStorage save successful!');
            console.log('👤 [LoginForm] User:', JSON.parse(savedUser)?.name);
            
            // Dispatch auth event
            window.dispatchEvent(new CustomEvent('authUpdated'));
            
            // Start token monitoring
            AuthService.startTokenMonitoring(() => {
              console.log('🔒 [LoginForm] Token expired');
              router.push('/login');
            });
            
            // Small delay then redirect
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('🚀 [LoginForm] Redirecting to dashboard...');
            router.push('/');
          } else {
            console.error('❌ [LoginForm] localStorage save FAILED!');
            setAlertMessage('فشل في حفظ بيانات تسجيل الدخول');
            setShowErrorAlert(true);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('❌ [LoginForm] Error saving to localStorage:', error);
          setAlertMessage('حدث خطأ في حفظ البيانات');
          setShowErrorAlert(true);
          setIsLoading(false);
        }
      } else {
        // Session is authenticated but missing data
        console.error('❌ [LoginForm] Session authenticated but missing data:', {
          hasBackendToken: !!session?.backendToken,
          hasBackendUser: !!session?.user?.backendUser
        });
        setAlertMessage('فشل في الحصول على بيانات المستخدم');
        setShowErrorAlert(true);
        setIsLoading(false);
      }
    }
  };

  handleSocialAuth();
}, [session, status, router, searchParams, allowAutoLogin]);

// Keep your existing OAuth error handler
useEffect(() => {
  const error = searchParams?.get('error');
  if (error) {
    console.error('❌ [LoginForm] OAuth error from URL:', error);
    let errorMessage = 'فشل تسجيل الدخول عبر الحساب الاجتماعي';
    
    if (error === 'OAuthCallback') {
      errorMessage = 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
    } else if (error === 'AccessDenied') {
      errorMessage = 'تم إلغاء تسجيل الدخول';
    } else if (error === 'Configuration') {
      errorMessage = 'خطأ في إعدادات تسجيل الدخول';
    }
    
    setAlertMessage(errorMessage);
    setShowErrorAlert(true);
    setIsLoading(false);
  }
}, [searchParams]);

  // ✅ NEW: Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      console.log('🚪 [LoginForm] Logout event detected');
      sessionStorage.removeItem('oauth_initiated');
      localStorage.setItem('just_logged_out', 'true');
    };

    window.addEventListener('userLoggedOut', handleLogout);
    
    return () => {
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }
    
    return newErrors;
  };

  const isFormValid = () => {
    return (
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password
    );
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await AuthService.login(formData);
      
      if (response.status === 'success') {
        const userRecord = normalizeUserRecord(response.data.user);
        if (!hasAcceptedPolicies(userRecord) && !hasLocalPolicyAcceptance()) {
          storePendingAuth(response.data.token, userRecord);
          AuthService.clearAuthData();
          localStorage.removeItem('authToken');
          setIsLoading(false);
          router.push('/accept-policies');
          return;
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authUpdated'));
        }
        router.push('/');
      } else {
        setAlertMessage('يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول.');
        setShowVerificationAlert(true);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

 const handleGoogleLogin = async () => {
  try {
    console.log('🔵 [LoginForm] Starting Google login...');
    setIsLoading(true);
    setErrors({});

    // Store in sessionStorage to persist across OAuth redirect
    sessionStorage.setItem('oauth_initiated', 'true');
    setAllowAutoLogin(true);
    
    // Clear any previous errors
    sessionStorage.removeItem('user_logged_out');
    
    // Use callbackUrl that includes oauth flag
    await signIn('google', { 
      callbackUrl: '/login?oauth=callback',
      redirect: true
    });
    
  } catch (error) {
    console.error('❌ [LoginForm] Google login error:', error);
    setAlertMessage('حدث خطأ في تسجيل الدخول عبر Google');
    setShowErrorAlert(true);
    setIsLoading(false);
  }
};

 
  if (status === 'loading') {
    return (
      <>
        <Background />
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.header}>
              <Image
                src={Logo}
                alt="Logo"
                width={160}
                height={48}
                sizes="160px"
                className={styles.logo}
                priority
              />
              
              <h2 className={styles.title}>جاري التحميل...</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Background />
      
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <Image
              src={Logo}
              alt="Logo"
              width={160}
              height={48}
              sizes="160px"
              className={styles.logo}
              priority
            />
            <h2 className={styles.title}>تسجيل الدخول</h2>
          </div>

          <div className={styles.form}>
            {errors.general && (
              <div className={styles.errorMessage}>
                <p className={styles.errorText}>{errors.general}</p>
              </div>
            )}

            <div className={styles.inputGroup}>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="البريد الإلكتروني"
                error={!!errors.email}
                disabled={isLoading}
                className={styles.Input}
              />
              {errors.email && (
                <p className={styles.errorText}>{errors.email}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="كلمة المرور"
                error={!!errors.password}
                disabled={isLoading}
                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onIconClick={() => setShowPassword(!showPassword)}
                iconPosition="left"
                className={styles.Input}
              />
              {errors.password && (
                <p className={styles.errorText}>{errors.password}</p>
              )}
            </div>

            <div className={styles.forgotPasswordSection}>
              <button 
                type="button"
                className={styles.forgotPasswordLink}
                onClick={() => router.push('/reset-password')}
                disabled={isLoading}
              >
                هل نسيت كلمة المرور؟
              </button>
            </div>

            <div className={styles.submitButtonWrapper}>
              <Button
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={`${styles.submitButton} ${
                  isFormValid() ? styles.submitButtonValid : styles.submitButtonInvalid
                }`}
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </div>

            <div className={styles.socialLoginSection}>
              <div className={styles.registerSection}>
                <p className={styles.registerText}>
                  ليس لديك حساب؟{' '}
                  <button 
                    type="button"
                    className={styles.registerLink}
                    onClick={() => router.push('/register')}
                    disabled={isLoading}
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              </div>

              <div className={styles.socialButtons}>
                <button 
                  type="button"
                  className={styles.socialButton}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  title="تسجيل الدخول باستخدام Google"
                  aria-label="تسجيل الدخول باستخدام Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVerificationAlert && (
        <Alert
          message={alertMessage}
          setClose={() => setShowVerificationAlert(false)}
          buttons={[
            { 
              label: 'حسناً', 
              onClick: () => setShowVerificationAlert(false), 
              variant: 'primary' 
            }
          ]}
          type="info"
        />
      )}

      {showErrorAlert && (
        <Alert
          message={alertMessage}
          setClose={() => setShowErrorAlert(false)}
          buttons={[
            { 
              label: 'إغلاق', 
              onClick: () => setShowErrorAlert(false), 
              variant: 'danger' 
            }
          ]}
          type="error"
        />
      )}
    </>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <>
        <Background />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>جاري التحميل...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    }>
      <LoginFormContent />
    </Suspense>
  );
}