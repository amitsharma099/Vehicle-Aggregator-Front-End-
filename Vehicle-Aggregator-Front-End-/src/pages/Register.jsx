import React, { useState } from 'react';
import { User, Mail, Phone, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import BenefitsPanel from '../components/BenefitsPanel';
import CountrySelect from '../components/CountrySelect';
import LegalModal from '../components/LegalModal';
import CustomerCare from '../components/CustomerCare';
import { registerUser, ApiError } from '../services/authService.js';
import styles from './Register.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+91',
    mobile: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | null

  // Validation function
  const validateField = (field, value, allValues = formData) => {
    let error = '';

    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Please enter your full name';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters long';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Please enter your email address';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'mobile': {
        const cleanMobile = value.replace(/\D/g, '');
        if (!cleanMobile) {
          error = 'Mobile number is required';
        } else if (cleanMobile.length !== 10) {
          error = 'Please enter a valid 10-digit mobile number';
        } else if (!/^[6-9]/.test(cleanMobile)) {
          error = 'Please enter a valid 10-digit mobile number';
        }
        break;
      }

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (value.length > 20) {
          error = 'Password must not exceed 20 characters';
        } else if (!(/[a-zA-Z]/.test(value) && /[0-9]/.test(value))) {
          error = 'Password must contain both letters and numbers';
        } else if (!/^[A-Za-z0-9]+$/.test(value)) {
          error = 'Password must contain only letters and numbers with no special characters';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== allValues.password) {
          error = 'Passwords do not match';
        }
        break;

      case 'agreeTerms':
        if (!value) {
          error = 'You must accept the Terms of Service and Privacy Policy';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let fieldValue = type === 'checkbox' ? checked : value;

    if (name === 'mobile') {
      // Prevent alphabetic and special characters; accept maximum 10 digits
      fieldValue = fieldValue.replace(/\D/g, '').slice(0, 10);
    }

    const updatedFormData = {
      ...formData,
      [name]: fieldValue,
    };
    setFormData(updatedFormData);
    if (serverError) {
      setServerError(null);
    }

    // Validate on the fly if already touched
    if (touched[name]) {
      const fieldError = validateField(name, fieldValue, updatedFormData);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    // Also revalidate confirm password if password changes and confirmPassword has been touched
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleMobileKeyDown = (e) => {
    // Allow navigation keys, backspace, delete, tab, enter, copy/paste shortcuts
    if (
      ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Prevent alphabetic characters and non-numeric keystrokes
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field], formData);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleCountryChange = (code) => {
    // Strictly enforce +91 for India
    const validCode = code === '+91' ? '+91' : '+91';
    const updated = { ...formData, countryCode: validCode };
    setFormData(updated);
    if (touched.mobile) {
      const error = validateField('mobile', formData.mobile, updated);
      setErrors((prev) => ({ ...prev, mobile: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submission while already submitting
    if (isSubmitting) {
      return;
    }

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    const isValid = validateAll();
    if (!isValid) {
      // Focus on first invalid element
      const firstErrorField = Object.keys(formData).find(
        (key) => validateField(key, formData[key], formData) !== ''
      );
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField);
        if (el) el.focus();
      }
      return;
    }

    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
          setTouched((prev) => ({
            ...prev,
            ...Object.keys(err.fieldErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
          }));
          const firstField = Object.keys(err.fieldErrors)[0];
          const el = document.getElementById(firstField);
          if (el) el.focus();
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
      // Never log sensitive data such as passwords
      console.error('Registration failed:', err?.message || 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      countryCode: '+91',
      mobile: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    });
    setTouched({});
    setErrors({});
    setServerError(null);
    setIsSuccess(false);
  };

  return (
    <main className={styles.pageWrapper}>
      {/* Top Brand Header */}
      <header className={styles.topHeader}>
        <div className={styles.logoLink}>
          <Logo size="medium" />
        </div>
      </header>

      {/* Main Container */}
      <div className={styles.container}>
        <div className={styles.registrationCard}>
          {/* Left Column: Registration Form */}
          <section className={styles.formSection} aria-labelledby="form-heading">
            {isSuccess ? (
              <div className={styles.successState} role="status" aria-live="polite">
                <div className={styles.successIconWrapper}>
                  <CheckCircle2 size={48} className={styles.successIcon} />
                </div>
                <h2 className={styles.successTitle}>Account created successfully!</h2>
                <p className={styles.successMessage}>
                  Welcome to ShopEase, <strong>{formData.fullName}</strong>! We've sent an OTP
                  verification link to <strong>{formData.email}</strong>.
                </p>

                <div className={styles.successDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Mobile:</span>
                    <span className={styles.detailVal}>
                      {formData.countryCode} {formData.mobile}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span className={styles.statusBadge}>Active</span>
                  </div>
                </div>

                <div className={styles.successActions}>
                  <button
                    type="button"
                    onClick={handleReset}
                    className={styles.resetButton}
                  >
                    <RefreshCw size={16} />
                    Register another account
                  </button>
                  <a
                    href="#login"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Redirecting to login preview...');
                    }}
                    className={styles.continueButton}
                  >
                    <span>Proceed to Log in</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h1 id="form-heading" className={styles.heading}>
                    Create Your Account
                  </h1>
                  <p className={styles.subtitle}>
                    Join ShopEase and start shopping today!
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className={styles.form}>
                  {serverError && (
                    <div className={styles.serverErrorBanner} role="alert" aria-live="assertive">
                      <AlertCircle size={20} className={styles.serverErrorIcon} aria-hidden="true" />
                      <div className={styles.serverErrorContent}>
                        <p className={styles.serverErrorTitle}>Registration Failed</p>
                        <p className={styles.serverErrorMessage}>{serverError}</p>
                      </div>
                    </div>
                  )}

                  {/* 1. Full Name */}
                  <InputField
                    id="fullName"
                    name="fullName"
                    label="Full Name *"
                    placeholder="Enter your full name"
                    icon={User}
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('fullName')}
                    error={touched.fullName ? errors.fullName : ''}
                    autoComplete="name"
                    required
                  />

                  {/* 2. Email Address */}
                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address *"
                    placeholder="Enter your email address"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    error={touched.email ? errors.email : ''}
                    autoComplete="email"
                    required
                  />

                  {/* 3. Mobile Number */}
                  <InputField
                    id="mobile"
                    name="mobile"
                    type="tel"
                    label="Mobile Number *"
                    placeholder="Enter your mobile number"
                    icon={Phone}
                    value={formData.mobile}
                    onChange={handleChange}
                    onKeyDown={handleMobileKeyDown}
                    onBlur={() => handleBlur('mobile')}
                    error={touched.mobile ? errors.mobile : ''}
                    helperText="We'll send an OTP to verify your number."
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={10}
                    countrySelector={
                      <CountrySelect
                        value={formData.countryCode}
                        onChange={handleCountryChange}
                      />
                    }
                    required
                  />

                  {/* 4. Password */}
                  <PasswordField
                    id="password"
                    name="password"
                    label="Password *"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    error={touched.password ? errors.password : ''}
                    helperText="At least 8 characters with letters and numbers"
                    showRequirements={true}
                    autoComplete="new-password"
                    required
                  />

                  {/* 5. Confirm Password */}
                  <PasswordField
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password *"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    error={touched.confirmPassword ? errors.confirmPassword : ''}
                    autoComplete="new-password"
                    required
                  />

                  {/* 6. Terms Checkbox */}
                  <div className={styles.checkboxGroup}>
                    <div className={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        onBlur={() => handleBlur('agreeTerms')}
                        className={`${styles.checkbox} ${
                          touched.agreeTerms && errors.agreeTerms ? styles.checkboxError : ''
                        }`}
                        aria-invalid={touched.agreeTerms && errors.agreeTerms ? 'true' : 'false'}
                        aria-describedby={
                          touched.agreeTerms && errors.agreeTerms ? 'terms-error' : undefined
                        }
                      />
                      <label htmlFor="agreeTerms" className={styles.checkboxLabel}>
                        I agree to the{' '}
                        <button
                          type="button"
                          className={styles.inlineLink}
                          onClick={() => setActiveModal('terms')}
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          className={styles.inlineLink}
                          onClick={() => setActiveModal('privacy')}
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    {touched.agreeTerms && errors.agreeTerms && (
                      <p id="terms-error" className={styles.termsErrorMessage} role="alert">
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>

                  {/* 7. Primary button */}
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className={styles.loadingSpinnerWrapper}>
                        <span className={styles.spinner} />
                        Creating Account...
                      </span>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>

                  {/* 8. Bottom text */}
                  <div className={styles.footerText}>
                    <span>Already have an account? </span>
                    <a
                      href="#login"
                      className={styles.loginLink}
                      onClick={(e) => {
                        e.preventDefault();
                        // Visual link only as per specification
                      }}
                    >
                      Log in
                    </a>
                  </div>
                </form>
              </>
            )}
          </section>

          {/* Right Column (Desktop) / Bottom Section (Mobile): Benefits Panel */}
          <section className={styles.benefitsSection}>
            <BenefitsPanel />
          </section>
        </div>

        {/* Page Support Footer with Customer Care */}
        <footer className={styles.pageFooter}>
          <p className={styles.footerSupportText}>Need help with registration?</p>
          <CustomerCare id="page-footer-customer-care" />
        </footer>
      </div>

      {/* Modal for Terms of Service and Privacy Policy */}
      <LegalModal
        isOpen={activeModal !== null}
        type={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </main>
  );
}
