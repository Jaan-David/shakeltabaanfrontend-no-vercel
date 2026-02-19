'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UI/Buttons/Button';
import PolicyConsent from '@/components/Auth/PolicyConsent';
import styles from '../auth.module.css';
import { AuthService, UserStorage, type User } from '@/services/auth/login';
import { saveAuthToken } from '@/utils/auth';

interface PendingAuthData {
  token: string;
  user: User;
}

const PENDING_AUTH_KEY = 'policy_pending_auth';

export default function AcceptPoliciesPage() {
  const router = useRouter();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingAuth = useMemo<PendingAuthData | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(PENDING_AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingAuthData;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!pendingAuth && !AuthService.getToken()) {
      router.replace('/login');
    }
  }, [pendingAuth, router]);

  const handleSubmit = async () => {
    if (!hasAccepted) {
      setErrorMessage('يجب الموافقة على سياسات المنصة قبل إنشاء الحساب');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const token = pendingAuth?.token || AuthService.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      const acceptedPoliciesAt = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('policy_accepted', 'true');
        localStorage.setItem('policy_accepted_at', acceptedPoliciesAt);
      }

      if (pendingAuth) {
        UserStorage.saveUser({
          ...pendingAuth.user,
          acceptedPolicies: true,
          acceptedPoliciesAt,
        });
        UserStorage.saveToken(token);
        saveAuthToken(token);
        sessionStorage.removeItem(PENDING_AUTH_KEY);
      }

      router.replace('/');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'فشل تحديث موافقة السياسات. يرجى المحاولة مرة أخرى.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h2 className={styles.title}>الموافقة على السياسات</h2>
          </div>
          <div className={styles.form}>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              لإكمال التسجيل وتسجيل الدخول يجب الموافقة على سياسات وشروط منصة شق الثعبان.
            </p>

            <PolicyConsent
              id="accept-policies"
              checked={hasAccepted}
              onChange={(value) => {
                setHasAccepted(value);
                if (value) setErrorMessage('');
              }}
              errorMessage={errorMessage}
              disabled={isSubmitting}
            />

            <div className={styles.submitButtonWrapper}>
              <Button
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={`${styles.submitButton} disabled:bg-gray-300 disabled:border-gray-300 disabled:text-slate-500`}
                onClick={handleSubmit}
                disabled={!hasAccepted || isSubmitting}
              >
                {isSubmitting ? 'جاري الحفظ...' : 'أوافق وأكمل التسجيل'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
