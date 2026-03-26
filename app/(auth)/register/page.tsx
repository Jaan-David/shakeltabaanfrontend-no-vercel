"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Button } from "./../../../components/UI/Buttons/Button";
import Input from "./../../../components/UI/Inputs/Input";
import Logo from "@/public/logo/logo2.png";
import Alert from "@/components/UI/Alert/alert";
import GoogleAuthSection from "@/components/Auth/GoogleAuthSection";
import styles from "./../auth.module.css";
import { registerUser, RegisterRequest } from "../../../services/auth/register";
import PolicyConsent from "@/components/Auth/PolicyConsent";
import {
  AuthApiError,
  getGoogleClientId,
  requestGoogleIdToken,
  signupWithGoogle,
} from "@/services/auth/googleAuth";

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

const getPasswordChecks = (value: string) => [
  {
    id: "minLength",
    label: "8 أحرف على الأقل",
    passed: value.length >= 8,
    errorMessage: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
  },
  {
    id: "uppercase",
    label: "حرف كبير واحد على الأقل (A-Z)",
    passed: /(?=.*[A-Z])/.test(value),
    errorMessage: "كلمة المرور يجب أن تحتوي على حرف كبير",
  },
  {
    id: "lowercase",
    label: "حرف صغير واحد على الأقل (a-z)",
    passed: /(?=.*[a-z])/.test(value),
    errorMessage: "كلمة المرور يجب أن تحتوي على حرف صغير",
  },
  {
    id: "number",
    label: "رقم واحد على الأقل (0-9)",
    passed: /(?=.*\d)/.test(value),
    errorMessage: "كلمة المرور يجب أن تحتوي على رقم",
  },
  {
    id: "special",
    label: "رمز خاص واحد على الأقل (@$!%*?&#)",
    passed: /(?=.*[@$!%*?&#])/.test(value),
    errorMessage: "كلمة المرور يجب أن تحتوي على رمز خاص (@$!%*?&#)",
  },
];

const getFirstPasswordError = (value: string) => {
  const firstInvalidRule = getPasswordChecks(value).find((rule) => !rule.passed);
  return firstInvalidRule?.errorMessage;
};

const isPasswordStrong = (value: string) => getPasswordChecks(value).every((rule) => rule.passed);

function RegistrationFormComponent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    general?: string;
  }>({});

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handelPass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      password: value,
    }));

    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error when any field changes
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phoneNumber?: string;
    } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "الاسم الأخير مطلوب";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else {
      const passwordError = getFirstPasswordError(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    }

    return newErrors;
  };

  // Enhanced form validation
  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password &&
      isPasswordStrong(formData.password) &&
      formData.phoneNumber.trim()
    );
  };

  const passwordChecks = getPasswordChecks(formData.password);
  const showPasswordChecklist = Boolean(formData.password) || Boolean(errors.password);

  const getDisabledReason = () => {
    if (isLoading || isGoogleLoading) return "";
    if (!hasAcceptedPolicies) return "يرجى الموافقة على الشروط وسياسات المنصة لإكمال التسجيل.";
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phoneNumber.trim()) {
      return "يرجى استكمال جميع الحقول المطلوبة.";
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      return "يرجى إدخال بريد إلكتروني صحيح.";
    }
    if (!isPasswordStrong(formData.password)) {
      return "يرجى استيفاء متطلبات كلمة المرور قبل إنشاء الحساب.";
    }

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
    //console.log("🚀 Starting registration process...");

    // Validate form first
    const newErrors = validateForm();

    if (!hasAcceptedPolicies) {
      setPolicyError("يجب الموافقة على سياسات المنصة قبل إنشاء الحساب");
    }

    if (Object.keys(newErrors).length > 0 || !hasAcceptedPolicies) {
      //console.log("❌ Form validation failed:", newErrors);
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Clean and prepare data
      const registerData: RegisterRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(), // Ensure lowercase email
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        organizationId: "website-org",
      };

      //console.log("📤 Sending registration data:", {
      //   ...registerData,
      //   password: "[HIDDEN]", // Don't log password
      // });

      const response = await registerUser(registerData);
      //console.log("📥 Registration response:", response);

      if (response.status === "success") {
        //console.log("✅ Registration successful:", response.data.user);

        // Show success message to user
        setAlertMessage(
          "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب."
        );
        setShowSuccessAlert(true);
        setTimeout(() => {
          router.push("/active-code");
        }, 1200);
      }
    } catch (error: unknown) {
      //console.error("❌ Registration failed:", error);

      // Enhanced error handling with Arabic translations
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.";
      let fieldErrors: Record<string, string> = {};
      const apiError = error as {
        message?: string;
        response?: { status?: number; data?: unknown };
        status?: number;
        errors?: Record<string, string>;
      };

      // Handle network errors
      if (apiError.message && apiError.message.includes("Network error")) {
        errorMessage =
          "لا يمكن الوصول إلى الخادم. يرجى التحقق من الاتصال بالإنترنت.";
      } else if (apiError.response || apiError.status) {
        // Server responded with an error
        const status = apiError.status || apiError.response?.status;

        //console.log("🔍 Error details:", {
        //   status,
        //   responseData,
        //   errors: error.errors,
        // });

        // Handle specific status codes
        switch (status) {
          case 400:
            errorMessage = "البيانات المدخلة غير صحيحة. يرجى مراجعة المعلومات.";
            if (apiError.message && apiError.message !== "Registration failed") {
              errorMessage = apiError.message;
            }
            if (apiError.errors) {
              fieldErrors = apiError.errors;
            }
            break;
          case 409:
            errorMessage =
              "البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.";
            break;
          case 422:
            errorMessage =
              "البيانات المدخلة لا تتوافق مع المتطلبات. يرجى مراجعة المعلومات.";
            if (apiError.errors) {
              fieldErrors = apiError.errors;
            }
            break;
          case 500:
            errorMessage = "خطأ في الخادم. يرجى المحاولة لاحقاً.";
            break;
          default:
            errorMessage =
              apiError.message ||
              `خطأ غير متوقع (${status}). يرجى المحاولة مرة أخرى.`;
        }
      } else {
        // Handle other error types
        errorMessage = apiError.message || errorMessage;
      }

      // Translate common field errors to Arabic if needed
      const translatedFieldErrors: Record<string, string> = {};
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.keys(fieldErrors).forEach((field: string) => {
          translatedFieldErrors[field] =
            fieldErrors[field as keyof typeof fieldErrors]; // Keep original for now, can add translation logic
        });
      }

      // Set errors
      setErrors({
        ...translatedFieldErrors,
      });

      // Show error alert
      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
    router.push("/active-code");
  };

  const handleGoogleSignup = async () => {
    setGoogleError("");

    setIsGoogleLoading(true);

    try {
      const googleClientId = await getGoogleClientId();
      const idToken = await requestGoogleIdToken(googleClientId);
      const response = await signupWithGoogle(idToken);

      const redirectPath = response.data.needsProfileCompletion
        ? "/complete-profile"
        : "/home";
      router.push(redirectPath);
    } catch (error) {
      const message = extractAuthErrorMessage(
        error,
        "تعذر التسجيل عبر Google. يرجى المحاولة مرة أخرى."
      );

      setGoogleError(message);
      setAlertMessage(message);
      setShowErrorAlert(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <div className={`${styles.container} ${styles.registerContainer}`}>
        <div className={`${styles.formWrapper} ${styles.registerFormWrapper}`}>
          {/* Logo and Title */}
          <div className={`${styles.header} ${styles.registerHeader}`}>
            <Image
              src={Logo}
              alt="Logo"
              width={677}
              height={369}
              sizes="(max-width: 768px) 180px, 220px"
              className={styles.logo}
              priority
            />

            <h2 className={`${styles.title} ${styles.registerTitle}`}>إنشاء حساب جديد</h2>
          </div>

          {/* Form */}
          <div className={`${styles.form} ${styles.registerForm}`}>
            {/* General Error Message */}
            {errors.general && (
              <div className={styles.registerGeneralError} role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <p>{errors.general}</p>
              </div>
            )}

            {/* First Name and Last Name */}
            <div className={`${styles.nameRow} ${styles.registerNameRow}`}>
              <div className={`${styles.inputGroup} ${styles.registerInputGroup}`}>
                <label className={styles.fieldLabel} htmlFor="firstName">
                  الاسم الأول
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="الاسم الأول"
                  error={!!errors.firstName}
                  icon={<UserRound size={16} />}
                  iconPosition="right"
                  className={styles.registerInput}
                  disabled={isLoading || isGoogleLoading}
                />
                {renderInlineError(errors.firstName)}
              </div>

              <div className={`${styles.inputGroup} ${styles.registerInputGroup}`}>
                <label className={styles.fieldLabel} htmlFor="lastName">
                  الاسم الأخير
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="الاسم الأخير"
                  error={!!errors.lastName}
                  icon={<UserRound size={16} />}
                  iconPosition="right"
                  className={styles.registerInput}
                  disabled={isLoading || isGoogleLoading}
                />
                {renderInlineError(errors.lastName)}
              </div>
            </div>

            {/* Phone Number */}
            <div className={`${styles.inputGroup} ${styles.registerInputGroup}`}>
              <label className={styles.fieldLabel} htmlFor="phoneNumber">
                رقم الهاتف
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="رقم الهاتف"
                error={!!errors.phoneNumber}
                icon={<Phone size={16} />}
                iconPosition="right"
                className={styles.registerInput}
                disabled={isLoading || isGoogleLoading}
              />
              {renderInlineError(errors.phoneNumber)}
            </div>

            {/* Email */}
            <div className={`${styles.inputGroup} ${styles.registerInputGroup}`}>
              <label className={styles.fieldLabel} htmlFor="email">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="البريد الإلكتروني"
                error={!!errors.email}
                icon={<Mail size={16} />}
                iconPosition="right"
                className={styles.registerInput}
                disabled={isLoading || isGoogleLoading}
              />
              {renderInlineError(errors.email)}
            </div>

            {/* Password */}
            <div className={`${styles.inputGroup} ${styles.registerInputGroup}`}>
              <label className={styles.fieldLabel} htmlFor="password">
                كلمة المرور
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handelPass}
                placeholder="كلمة المرور"
                error={!!errors.password}
                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onIconClick={() => setShowPassword(!showPassword)}
                iconAriaLabel={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                iconPosition="left"
                className={styles.registerInput}
                disabled={isLoading || isGoogleLoading}
              />

              {showPasswordChecklist && (
                <div className={styles.passwordRequirements}>
                  <p className={styles.passwordHint}>يجب أن تحتوي كلمة المرور على:</p>
                  <ul className={styles.passwordChecklist}>
                    {passwordChecks.map((rule) => (
                      <li
                        key={rule.id}
                        className={rule.passed ? styles.ruleMet : styles.rulePending}
                      >
                        {rule.passed ? (
                          <CheckCircle2 size={14} aria-hidden="true" />
                        ) : (
                          <Circle size={14} aria-hidden="true" />
                        )}
                        <span>{rule.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {renderInlineError(errors.password)}
            </div>

            <div className={styles.registerPolicySection}>
              <PolicyConsent
                id="register-policy-consent"
                checked={hasAcceptedPolicies}
                onChange={(checked) => {
                  setHasAcceptedPolicies(checked);
                  if (checked) {
                    setPolicyError("");
                  }
                }}
                errorMessage={policyError}
                disabled={isLoading || isGoogleLoading}
              />
            </div>

            {/* Submit Button */}
            <div className={`${styles.submitButtonWrapper} ${styles.registerSubmitSection}`}>
              <Button
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={`${styles.submitButton} ${styles.registerSubmitButton} ${
                  isFormValid()
                    ? styles.submitButtonValid
                    : styles.submitButtonInvalid
                } disabled:bg-gray-300 disabled:border-gray-300 disabled:text-slate-500`}
                onClick={handleSubmit}
                disabled={!isFormValid() || !hasAcceptedPolicies || isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <span className={styles.buttonLoadingContent}>
                    <span className={styles.buttonSpinnerLight} aria-hidden="true" />
                    <span>جاري إنشاء الحساب...</span>
                  </span>
                ) : (
                  "إنشاء حساب"
                )}
              </Button>

              {disabledReason && (
                <p className={styles.submitStatusHint} role="status" aria-live="polite">
                  <TriangleAlert size={14} aria-hidden="true" />
                  <span>{disabledReason}</span>
                </p>
              )}

              <p className={styles.submitMicrocopy}>
                بإنشائك حساب، أنت توافق على الشروط وسياسة الخصوصية.
              </p>
            </div>

            <GoogleAuthSection
              onContinue={handleGoogleSignup}
              isLoading={isGoogleLoading}
              disabled={isLoading}
              errorMessage={googleError}
              onRetry={googleError ? handleGoogleSignup : undefined}
            />

            {/* Login Link */}
            <div className={`${styles.loginSection} ${styles.registerLoginSection}`}>
              <p className={styles.loginText}>
                هل لديك حساب؟{" "}
                <button
                  type="button"
                  className={styles.loginLink}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push("/login");
                  }}
                  disabled={isLoading || isGoogleLoading}
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert
          message={alertMessage}
          setClose={() => setShowSuccessAlert(false)}
          buttons={[
            {
              label: "حسناً",
              onClick: handleSuccessConfirm,
              variant: "primary",
            },
          ]}
          type="success"
        />
      )}

      {/* Error Alert */}
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

const RegistrationForm = dynamic(() => Promise.resolve(RegistrationFormComponent), {
  ssr: false,
});

export default RegistrationForm;