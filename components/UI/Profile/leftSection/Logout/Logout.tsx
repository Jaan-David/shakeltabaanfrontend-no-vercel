'use client';
import { signOut } from 'next-auth/react'; // Import NextAuth signOut

import { AuthService } from '@/services/auth/login';

//styles
import styles from '@/components/UI/Profile/leftSection/Logout/Logout.module.css';

interface LogoutProps {
  onCancel?: (value: string) => void;
  onLogout?: () => void;
}

export default function Logout({ onCancel, onLogout: _onLogout }: LogoutProps) {
  
  const handleLogout = async () => {
  try {
    console.log('🚪 Starting logout...');
    
    // 1. Mark user as logged out
    sessionStorage.setItem('user_logged_out', 'true');
    sessionStorage.removeItem('social_login_pending');
    
    // 2. Clear localStorage
    await AuthService.logout();
    
    // 3. Sign out from NextAuth (this clears the session)
    await signOut({ 
      redirect: true, 
      callbackUrl: '/' 
    });
    
    console.log('✅ Logout complete');
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Force logout even if error
    sessionStorage.setItem('user_logged_out', 'true');
    AuthService.clearAuthData();
    window.location.href = '/';
  }
};
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel('');
    }
  };
  
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.question}>
          هل تريد تسجيل الخروج ؟
        </div>
       
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.logoutButton}`}
            onClick={handleLogout}
          >
            تسجيل الخروج
          </button>
         
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}