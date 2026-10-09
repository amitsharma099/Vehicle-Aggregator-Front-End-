import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CountrySelect.module.css';

const COUNTRIES = [
  { code: '+91', country: 'India', flag: '🇮🇳', length: 10 },
];

export default function CountrySelect({ value = '+91', onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Strictly restricted to India (+91)
  const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country) => {
    if (onChange) {
      onChange(country.code);
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.triggerButton}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select country code, currently ${selected.country} ${selected.code}`}
      >
        <span className={styles.flag}>{selected.flag}</span>
        <span className={styles.code}>{selected.code}</span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
        />
      </button>

      {isOpen && (
        <ul className={styles.dropdown} role="listbox">
          {COUNTRIES.map((country, idx) => (
            <li
              key={`${country.code}-${country.country}-${idx}`}
              role="option"
              aria-selected={selected.country === country.country}
              className={`${styles.option} ${
                selected.country === country.country ? styles.selectedOption : ''
              }`}
              onClick={() => handleSelect(country)}
            >
              <span className={styles.optionFlag}>{country.flag}</span>
              <span className={styles.optionCountry}>{country.country}</span>
              <span className={styles.optionCode}>{country.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
