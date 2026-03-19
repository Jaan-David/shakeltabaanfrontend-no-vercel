"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Eye, EyeOff, Mail, TriangleAlert } from "lucide-react";
import { Button } from "@/components/UI/Buttons/Button";
import Input from "@/components/UI/Inputs/Input";
import Logo from "@/public/logo/logo2.png";
import Alert from "@/components/UI/Alert/alert";
import GoogleAuthSection from "@/components/Auth/GoogleAuthSection";
import styles from "./../auth.module.css";
import {
  AuthService,
  AuthError,
  type LoginCredentials,
} from "@/services/auth/login";
import {
  AuthApiError,
  getGoogleClientId,
  requestGoogleIdToken,
  signupWithGoogle,
} from "@/services/auth/googleAuth";
import { hasAcceptedPolicies } from "@/utils/policyConsent";

interface PendingAuthData {
  token: string;
  user: Record<string, unknown>;
}

const PENDING_AUTH_KEY = "policy_pending_auth";

const extractAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AuthApiError && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
};

function LoginFormComponent() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const normalizeUserRecord = (user: unknown): Record<string, unknown> => {
    if (user && typeof user === "object") {
      return user as Record<string, unknown>;
    }
    return {};
  };

  const hasLocalPolicyAcceptance = (): boolean => {
    if (typeof window === "undefined") return false;
    const flag = localStorage.getItem("policy_accepted");
    if (flag === "true") return true;
    const storedUser = localStorage.getItem("user_data");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        general: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }

    return newErrors;
  };

  const isFormValid = () => {
    return (
      formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email) && formData.password
    );
  };

  const getDisabledReason = () => {
    if (isLoading || isGoogleLoading) return "";
    if (!formData.email.trim()) return "يرجى إدخال البريد الإلكتروني للمتابعة.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "يرجى إدخال بريد إلكتروني صحيح.";
    if (!formData.password) return "يرجى إدخال كلمة المرور للمتابعة.";
    return "";
  };

  const disabledReason = getDisabledReason();

  const renderInlineError = (message?: string) => {
    if (!message) return null;

    return (
      <p className={styles.fieldError} role="alert">
        <TriangleAlert size={14} aria-hidden="true" />
        <span>{message}</span>
      </p>
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

      if (response.status === "success") {
        const userRecord = normalizeUserRecord(response.data.user);

        if (!hasAcceptedPolicies(userRecord) && !hasLocalPolicyAcceptance()) {
          storePendingAuth(response.data.token, userRecord);
          AuthService.clearAuthData();
          localStorage.removeItem("authToken");
          setIsLoading(false);
          router.push("/accept-policies");
          return;
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("authUpdated"));
        }

        router.push("/");
      } else {
        setAlertMessage(
          "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول."
        );
        setShowVerificationAlert(true);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleError("");
    setShowErrorAlert(false);

    setIsGoogleLoading(true);

    try {
      const googleClientId = await getGoogleClientId();
      const idToken = await requestGoogleIdToken(googleClientId);
      const response = await signupWithGoogle(idToken);

      const redirectPath = response.data.needsProfileCompletion ? "/complete-profile" : "/home";
      router.push(redirectPath);
    } catch (error) {
      const message =
        extractAuthErrorMessage(error, "تعذر تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.");

      setGoogleError(message);
      setAlertMessage(message);
      setShowErrorAlert(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <div className={`${styles.container} ${styles.loginContainer}`}>
        <div className={`${styles.formWrapper} ${styles.loginFormWrapper}`}>
          <div className={`${styles.header} ${styles.loginHeader}`}>
            <Image
              src={Logo}
              alt="Logo"
              width={160}
              height={48}
              sizes="160px"
              className={styles.logo}
              priority
            />
            <h2 className={`${styles.title} ${styles.loginTitle}`}>تسجيل الدخول</h2>
          </div>

          <div className={`${styles.form} ${styles.loginForm}`}>
            {errors.general && (
              <div className={styles.loginGeneralError} role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <p>{errors.general}</p>
              </div>
            )}

            <div className={`${styles.inputGroup} ${styles.loginInputGroup}`}>
              <label className={styles.fieldLabel} htmlFor="login-email">
                البريد الإلكتروني
              </label>
              <Input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="البريد الإلكتروني"
                error={!!errors.email}
                disabled={isLoading || isGoogleLoading}
                icon={<Mail size={16} />}
                iconPosition="right"
                className={styles.loginInput}
              />
              {renderInlineError(errors.email)}
            </div>

            <div className={`${styles.inputGroup} ${styles.loginInputGroup}`}>
              <label className={styles.fieldLabel} htmlFor="login-password">
                كلمة المرور
              </label>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="كلمة المرور"
                error={!!errors.password}
                disabled={isLoading || isGoogleLoading}
                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onIconClick={() => setShowPassword(!showPassword)}
                iconAriaLabel={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                iconPosition="left"
                className={styles.loginInput}
              />
              {renderInlineError(errors.password)}
            </div>

            <div className={`${styles.forgotPasswordSection} ${styles.loginForgotPasswordSection}`}>
              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={() => router.push("/reset-password")}
                disabled={isLoading || isGoogleLoading}
              >
                هل نسيت كلمة المرور؟
              </button>
            </div>

            <div className={`${styles.submitButtonWrapper} ${styles.loginSubmitSection}`}>
              <Button
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={`${styles.submitButton} ${styles.loginSubmitButton} ${
                  isFormValid() ? styles.submitButtonValid : styles.submitButtonInvalid
                }`}
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <span className={styles.buttonLoadingContent}>
                    <span className={styles.buttonSpinnerLight} aria-hidden="true" />
                    <span>جاري تسجيل الدخول...</span>
                  </span>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>

              {disabledReason && (
                <p className={styles.submitStatusHint} role="status" aria-live="polite">
                  <TriangleAlert size={14} aria-hidden="true" />
                  <span>{disabledReason}</span>
                </p>
              )}

              <p className={styles.submitMicrocopy}>
                بتسجيل الدخول، أنت توافق على الشروط وسياسة الخصوصية.
              </p>
            </div>

            <GoogleAuthSection
              onContinue={handleGoogleLogin}
              isLoading={isGoogleLoading}
              disabled={isLoading}
              errorMessage={googleError}
              onRetry={googleError ? handleGoogleLogin : undefined}
            />

            <div className={`${styles.registerSection} ${styles.loginRegisterSection}`}>
              <p className={styles.registerText}>
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  className={styles.registerLink}
                  onClick={() => router.push("/register")}
                  disabled={isLoading || isGoogleLoading}
                >
                  إنشاء حساب جديد
                </button>
              </p>
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
              label: "حسناً",
              onClick: () => setShowVerificationAlert(false),
              variant: "primary",
            },
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
              label: "إغلاق",
              onClick: () => setShowErrorAlert(false),
              variant: "danger",
            },
          ]}
          type="error"
        />
      )}
    </>
  );
}

const LoginForm = dynamic(() => Promise.resolve(LoginFormComponent), {
  ssr: false,
});

export default LoginForm;
