import React from 'react';
import styles from './Logo.module.css';

export default function Logo({ size = 'medium' }) {
  return (
    <div className={`${styles.logoContainer} ${styles[size]}`} aria-label="ShopEase Home">
      <div className={styles.iconWrapper}>
        <svg
          className={styles.brandIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Bag handle */}
          <path d="M6 8a6 6 0 0 1 12 0v1" strokeWidth="2.2" />
          {/* Bag body */}
          <path d="M3.5 9h17l-1.5 12h-14L3.5 9z" fill="currentColor" fillOpacity="0.15" strokeWidth="2" />
          {/* Smile / check curve inside bag */}
          <path d="M9 14c1 1.5 3 2.5 5 0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.textWrapper}>
        <span className={styles.brandShop}>Shop</span>
        <span className={styles.brandEase}>Ease</span>
      </div>
    </div>
  );
}
