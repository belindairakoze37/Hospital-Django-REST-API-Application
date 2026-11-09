// src/components/common/LanguageSwitcher.jsx
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Public, login-free language menu used in the landing-page header.
const LanguageSwitcher = ({ className = 'qc-topbar-link' }) => {
  const { language, languages, changeLanguage, t, getLanguageMetadata } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const optionRefs = useRef([]);
  const listId = useId();

  const current = getLanguageMetadata(language);
  const currentIndex = Math.max(
    0,
    languages.findIndex((item) => item.name === language)
  );

  const openMenu = useCallback(() => {
    setActiveIndex(currentIndex);
    setOpen(true);
  }, [currentIndex]);

  const closeMenu = useCallback(({ restoreFocus = false } = {}) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  const selectLanguage = useCallback(
    (name) => {
      changeLanguage(name);
      closeMenu({ restoreFocus: true });
    },
    [changeLanguage, closeMenu]
  );

  const focusOption = (index) => {
    setActiveIndex(index);
    optionRefs.current[index]?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) closeMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open, closeMenu]);

  const handleButtonKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu();
      focusOption(currentIndex);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu();
      focusOption(languages.length - 1);
    } else if (event.key === 'Escape') {
      closeMenu();
    }
  };

  const handleMenuKeyDown = (event) => {
    // Derive the base index from the focused option so rapid key presses never
    // act on a stale render value.
    const focusedIndex = optionRefs.current.indexOf(document.activeElement);
    const base = focusedIndex >= 0 ? focusedIndex : activeIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusOption((base + 1) % languages.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusOption((base - 1 + languages.length) % languages.length);
        break;
      case 'Home':
        event.preventDefault();
        focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        focusOption(languages.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        break;
      case 'Tab':
        closeMenu();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={`${className} qc-language-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${t('navLanguage')}: ${current.nativeName}`}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleButtonKeyDown}
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="qc-language-name">{current.nativeName}</span>
        <span className="qc-language-code" aria-hidden="true">
          {current.code}
        </span>
        <ChevronDown
          className={`qc-language-chevron w-3.5 h-3.5 ${open ? 'is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('navLanguage')}
          tabIndex={-1}
          className="qc-language-menu"
          onKeyDown={handleMenuKeyDown}
        >
          {languages.map((item, index) => {
            const isActive = item.name === language;
            return (
              <li key={item.name} className="qc-language-option-item" role="none">
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  tabIndex={index === activeIndex ? 0 : -1}
                  className={`qc-language-option ${isActive ? 'is-active' : ''}`}
                  onClick={() => selectLanguage(item.name)}
                >
                  <span className="qc-language-option-flag" aria-hidden="true">
                    {item.flag}
                  </span>
                  <span className="qc-language-option-name">{item.nativeName}</span>
                  <span className="qc-language-option-code" aria-hidden="true">
                    {item.code}
                  </span>
                  {isActive && <Check className="qc-language-option-check" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
