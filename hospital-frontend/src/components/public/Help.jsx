// src/components/public/Help.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PublicPage from './PublicPage';
import { useLanguage } from '../../context/LanguageContext';

const FAQS = [
  { id: 'queue', question: 'faqQueueQuestion', answer: 'faqQueueAnswer' },
  { id: 'book', question: 'faqBookQuestion', answer: 'faqBookAnswer' },
  { id: 'wait', question: 'faqWaitQuestion', answer: 'faqWaitAnswer' },
  { id: 'language', question: 'faqLanguageQuestion', answer: 'faqLanguageAnswer' },
];

const Help = () => {
  const { t } = useLanguage();
  const [openId, setOpenId] = useState(FAQS[0].id);

  return (
    <PublicPage title={t('helpTitle')} subtitle={t('helpSubtitle')}>
      <div className="qc-public-card">
        {FAQS.map(({ id, question, answer }) => {
          const isOpen = openId === id;
          return (
            <div key={id} className="qc-faq-item">
              <h2>
                <button
                  type="button"
                  className="qc-faq-question"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${id}`}
                  id={`faq-button-${id}`}
                  onClick={() => setOpenId(isOpen ? null : id)}
                >
                  <span>{t(question)}</span>
                  <ChevronDown
                    className={`qc-faq-icon ${isOpen ? 'is-open' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </h2>
              {isOpen && (
                <div
                  id={`faq-panel-${id}`}
                  role="region"
                  aria-labelledby={`faq-button-${id}`}
                  className="qc-faq-answer"
                >
                  {t(answer)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PublicPage>
  );
};

export default Help;
