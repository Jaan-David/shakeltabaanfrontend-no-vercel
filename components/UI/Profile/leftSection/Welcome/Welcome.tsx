import React from 'react';
import styles from './Welcom.module.css';

interface WelcomeProps {
  name: string;
}

const Welcome: React.FC<WelcomeProps> = ({ name }) => {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        <div className={styles.waveEmoji}>
          <span>👋</span>
        </div>
        <div className={styles.welcomeTextGroup}>
          <h1 className={styles.welcomeText}>مرحبا {name}</h1>
          <p className={styles.welcomeSubtitle}>
            هذه هي لوحة التحكم الخاصة بك لمتابعة نشاطك بسرعة.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;