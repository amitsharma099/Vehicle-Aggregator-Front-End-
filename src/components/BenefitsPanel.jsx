import React from 'react';
import { ShieldCheck, ShoppingBag, Headphones, CheckCircle2 } from 'lucide-react';
import CustomerCare from './CustomerCare';
import styles from './BenefitsPanel.module.css';

export default function BenefitsPanel() {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Secure & Safe',
      description: 'Your data is protected with industry-standard security.',
    },
    {
      icon: ShoppingBag,
      title: 'Easy Shopping',
      description: 'Faster checkout and personalized experience.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: "We're here to help whenever you need.",
      showCare: true,
    },
  ];

  return (
    <aside className={styles.benefitsPanel} aria-label="Why choose ShopEase">
      <div className={styles.header}>
        <span className={styles.badge}>
          <CheckCircle2 size={14} className={styles.badgeIcon} />
          Why ShopEase?
        </span>
        <h2 className={styles.heading}>Everything you need for a seamless shopping journey</h2>
      </div>

      <div className={styles.benefitsList}>
        {benefits.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className={styles.benefitCard}>
              <div className={styles.iconCircle}>
                <Icon size={22} className={styles.benefitIcon} strokeWidth={2.2} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
                {item.showCare && (
                  <div className={styles.supportCare}>
                    <CustomerCare id="benefits-customer-care" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
