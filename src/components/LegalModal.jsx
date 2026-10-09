import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import styles from './LegalModal.module.css';

export default function LegalModal({ isOpen, type, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const Icon = isTerms ? FileText : ShieldCheck;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <div className={styles.iconCircle}>
              <Icon size={20} className={styles.headerIcon} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>{title}</h2>
              <p className={styles.modalSubtitle}>Last updated: October 2026</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isTerms ? (
            <div className={styles.content}>
              <h3>1. Agreement to Terms</h3>
              <p>
                By creating an account with ShopEase, you agree to comply with and be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
              <h3>2. User Account & Responsibilities</h3>
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and
                for all activities that occur under your account. You agree to notify us immediately of
                any unauthorized use.
              </p>
              <h3>3. Orders, Pricing & Delivery</h3>
              <p>
                All orders are subject to acceptance and availability. Prices are displayed in local
                currency and include applicable statutory taxes unless stated otherwise.
              </p>
              <h3>4. Returns & Refunds</h3>
              <p>
                ShopEase offers a 14-day hassle-free return policy on eligible merchandise in original
                condition.
              </p>
            </div>
          ) : (
            <div className={styles.content}>
              <h3>1. Information We Collect</h3>
              <p>
                We collect personal information such as your name, email address, phone number, and
                shipping address when you create an account or make a purchase.
              </p>
              <h3>2. How We Use Your Data</h3>
              <p>
                We use your details to process orders, verify identity via OTP, personalize your
                shopping experience, and send important service notifications.
              </p>
              <h3>3. Data Protection & Encryption</h3>
              <p>
                We use industry-standard AES-256 encryption and SSL certificates to safeguard your
                sensitive data from unauthorized access or disclosure.
              </p>
              <h3>4. Third-Party Sharing</h3>
              <p>
                We never sell your personal information. Data is only shared with verified logistics
                partners and secure payment gateways necessary to fulfill your orders.
              </p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.doneButton} onClick={onClose}>
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
}
