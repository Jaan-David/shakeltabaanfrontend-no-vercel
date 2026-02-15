'use client';
import React, { useState } from 'react';
import { KeyRound, LogOut, MapPin, ShoppingBag, User } from 'lucide-react';

//styles
import styles from '@/components/UI/Profile/profile.module.css';


export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  image?: string | null;
  phoneNumber: string;
  department?: string | null;
  salary?: number | null;
  dateOfSubmission?: string | null;
  isVerified?: boolean;
  isEmailVerified: boolean;
  address?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  EmailVerificationToken?: string;
  EmailVerificationExpires?: string;
}

interface AccountListProps {
  onItemClick?: (item: string) => void;
  user?: User | null;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
  activeItem?: string;
}

const AccountList: React.FC<AccountListProps> = ({
  onItemClick,
  user,
  setUser: _setUser,
  activeItem,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const menuItems = [
    { label: 'تفاصيل الحساب', icon: User },
    { label: 'تغيير كلمة المرور', icon: KeyRound },
    { label: 'عناوينك', icon: MapPin },
    { label: 'طلباتك', icon: ShoppingBag },
    { label: 'تسجيل الخروج', icon: LogOut },
  ];

  

  const handleItemClick = async (item: string, index: number) => {
    setSelectedIndex(index);
    
    
    // Call the parent callback for other items
    onItemClick?.(item);
  };

  // Don't render the component if user is not available (optional)
  if (!user) {
    return (
      <div className={styles.container_list}>
        <div className={styles.list}>
          <div className={styles.listItem}>
            جاري تحميل البيانات...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container_list}>
      <div className={styles.list}>
        {menuItems.map((item, index) => {
          const isLogout = item.label === 'تسجيل الخروج';
          const isSelected = activeItem ? activeItem === item.label : selectedIndex === index;
          const Icon = item.icon;
          
          return (
            <div
              key={index}
              className={`${styles.listItem} ${
                isLogout 
                  ? isSelected 
                    ? styles.logoutSelected 
                    : styles.logout
                  : isSelected 
                    ? styles.selected 
                    : styles.default
              } ${isLoggingOut && isLogout ? styles.loading : ''}`}
              onClick={() => handleItemClick(item.label, index)}
              style={{
                cursor: isLoggingOut && isLogout ? 'not-allowed' : 'pointer',
                opacity: isLoggingOut && isLogout ? 0.6 : 1
              }}
            >
              {isLoggingOut && isLogout ? (
                <span>
                  جاري تسجيل الخروج...
                  {/* You can add a loading spinner here if you have one */}
                </span>
              ) : (
                <>
                  <span className={styles.listItemIcon}>
                    <Icon />
                  </span>
                  <span className={styles.listItemText}>{item.label}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountList;