import React from 'react';
import { PhoneCall } from 'lucide-react';
import {
  CUSTOMER_CARE,
  validateCustomerCareConfig,
  formatCustomerCareNumber,
  getCustomerCareTelUri,
} from '../config/contactConfig';
import styles from './CustomerCare.module.css';

/**
 * Reusable CustomerCare component for ShopEase.
 * US1 ST02: Displays validated and formatted Indian customer care number (+91 XXXXX XXXXX)
 * with click-to-call tel: link for Android and iOS mobile devices.
 * 
 * @param {Object} props
 * @param {Object} [props.config=CUSTOMER_CARE] - Contact config (centralized or from backend API)
 * @param {boolean} [props.showLabel=true] - Whether to show the prefix label ("Customer Care: ")
 * @param {string} [props.labelPrefix="Customer Care: "] - Text prefix
 * @param {boolean} [props.showIcon=true] - Whether to display phone icon
 * @param {'default' | 'inline' | 'pill'} [props.variant='default'] - Visual style variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.id='customer-care-link'] - Element ID for automated testing and a11y
 */
export default function CustomerCare({
  config = CUSTOMER_CARE,
  showLabel = true,
  labelPrefix = 'Customer Care: ',
  showIcon = true,
  variant = 'default',
  className = '',
  id = 'customer-care-link',
}) {
  // Validate configuration before rendering
  const validation = validateCustomerCareConfig(config);

  // If configuration is missing or invalid, do not display a broken phone link
  if (!validation.isValid || !validation.sanitizedNumber) {
    return null;
  }

  const formattedNumber = formatCustomerCareNumber(
    validation.sanitizedNumber,
    config?.countryCode || '+91'
  );
  const telUri = getCustomerCareTelUri(
    validation.sanitizedNumber,
    config?.countryCode || '+91'
  );

  // Fallback safety to ensure we never render broken link
  if (!formattedNumber || !telUri) {
    return null;
  }

  const variantClass =
    variant === 'inline'
      ? styles.inline
      : variant === 'pill'
        ? styles.pill
        : '';

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <a
        href={telUri}
        id={id}
        className={`${styles.careLink} ${variantClass}`.trim()}
        aria-label={`Call Customer Care at ${formattedNumber}`}
        title={`Call Customer Care: ${formattedNumber}`}
      >
        {showIcon && (
          <span className={styles.iconWrapper} aria-hidden="true">
            <PhoneCall size={15} strokeWidth={2.2} />
          </span>
        )}
        {showLabel && <span className={styles.labelText}>{labelPrefix}</span>}
        <span className={styles.numberText}>{formattedNumber}</span>
      </a>
    </div>
  );
}
