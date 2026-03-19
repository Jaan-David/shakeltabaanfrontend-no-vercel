"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/UI/Buttons/Button";
import Input from "@/components/UI/Inputs/Input";
import Alert from "@/components/UI/Alert/alert";
import PolicyConsent from "@/components/Auth/PolicyConsent";
import Logo from "@/public/logo/logo2.png";
import styles from "@/app/(auth)/auth.module.css";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Nationality } from "@/services/auth/googleAuth";
import { AuthApiError, updatePhoneNumber } from "@/services/auth/googleAuth";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { token, user, updateUser, refreshAuth } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user?.phoneNumber]);

  useEffect(() => {
    const hasStoredToken =
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("auth_token") ?? localStorage.getItem("authToken"));

    if (!token && !hasStoredToken) {
      router.replace("/login");
    }
  }, [token, router]);

  const canSubmit = useMemo(() => {
    return phoneNumber.trim().length > 0 && hasAcceptedPolicies && !isSubmitting;
  }, [phoneNumber, hasAcceptedPolicies, isSubmitting]);

  const getNationalityFromPhone = (value: string): Nationality => {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.length === 11 ? "Egyptian" : "Other";
  };

  const submitProfile = async () => {
    const normalizedPhone = phoneNumber.trim();
    if (!normalizedPhone) {
      setFieldError("رقم الهاتف مطلوب");
      return;
    }

    if (!hasAcceptedPolicies) {
      setPolicyError("يجب الموافقة على السياسات والشروط للمتابعة.");
      return;
    }

    const nationality = getNationalityFromPhone(normalizedPhone);

    setIsSubmitting(true);
    setFieldError("");
    setGeneralError("");

    try {
      const response = await updatePhoneNumber(normalizedPhone, nationality, token ?? undefined);
      updateUser(response.user);
      router.push("/home");
    } catch (error) {
      if (error instanceof AuthApiError) {
        if (error.fieldErrors.phoneNumber) {
          setFieldError(error.fieldErrors.phoneNumber);
        }

        setGeneralError(error.message);
      } else {
        setGeneralError("تعذر تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.");
      }

      setShowErrorAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
            <h2 className={styles.title}>إكمال الملف الشخصي</h2>
          </div>

          <div className={styles.form}>
            <p className={styles.helperText}>
              أكمل رقم الهاتف للمتابعة.
            </p>

            <div className={styles.inputGroup}>
              <Input
                type="tel"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(event) => {
                  setPhoneNumber(event.target.value);
                  if (fieldError) setFieldError("");
                  if (generalError) setGeneralError("");
                }}
                placeholder="رقم الهاتف"
                error={Boolean(fieldError)}
                className={styles.Input}
                disabled={isSubmitting}
              />
              {fieldError && <p className={styles.errorText}>{fieldError}</p>}
            </div>

            <div className="mt-4">
              <PolicyConsent
                id="complete-profile-policy-consent"
                checked={hasAcceptedPolicies}
                onChange={(checked) => {
                  setHasAcceptedPolicies(checked);
                  if (checked) {
                    setPolicyError("");
                  }
                }}
                errorMessage={policyError}
                disabled={isSubmitting}
              />
            </div>

            {generalError && (
              <div className={styles.socialErrorContainer}>
                <p className={styles.errorText}>{generalError}</p>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={submitProfile}
                  disabled={isSubmitting}
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            <div className={styles.submitButtonWrapper}>
              <Button
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={`${styles.submitButton} ${
                  canSubmit ? styles.submitButtonValid : styles.submitButtonInvalid
                }`}
                onClick={submitProfile}
                disabled={!canSubmit}
              >
                {isSubmitting ? "جاري الحفظ..." : "حفظ والمتابعة"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showErrorAlert && (
        <Alert
          message={generalError}
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
