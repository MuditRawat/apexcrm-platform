import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqList: FAQItem[] = [
    {
      question: "How long does migrating from Salesforce or HubSpot take?",
      answer: "Usually less than an hour. Our smart migration engine integrates directly with Salesforce, HubSpot, Pipedrive, and copper platforms via API. It automatically maps fields, imports your contact histories, and preserves your historic deal timeline structures with virtually zero manual data entry.",
    },
    {
      question: "What capabilities does Apex Intelligence AI provide?",
      answer: "Apex Intelligence works as a silent co-pilot. It automatically records and transcribes your audio calls, drafts contextual email follow-ups with customizable tones, extracts action items, and evaluates deal risk scoring. This helps sales managers focus exactly where deals might be stalling.",
    },
    {
      question: "Can I upgrade, downgrade, or cancel my team's seats at any time?",
      answer: "Yes, completely. ApexCRM is fully flexible. You can add or remove team seats instantly through your billing settings panel. Added seats are pro-rated for the remainder of your billing cycle, while removed seats apply as immediate pro-rated account credits to your next invoice.",
    },
    {
      question: "Is there a limit on workflow automations or pipelines?",
      answer: "Our Professional and Enterprise plans offer completely unlimited active pipelines and visual workflow automations. The Starter plan is limited to 5 active pipelines and 10 workflow automation rules, which fits perfectly for small, growing startups starting out.",
    },
    {
      question: "What security measures protect our client records?",
      answer: "Data protection is our highest priority. All account records are encrypted at rest with AES-256 standards and in transit using TLS 1.3. We are fully SOC 2 Type II certified and offer enterprise integrations like SAML Single Sign-On (SSO), multi-factor authentication, and granular row-level permission policies.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection} id="faq">
      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Frequently asked <span className={styles.highlight}>questions</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Got questions about integrations, security, or migration? We have compiled the answers to help you get started.
          </p>
        </div>

        {/* Accordion List */}
        <div className={styles.accordionContainer}>
          {faqList.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`${styles.accordionItem} ${isOpen ? styles.itemOpen : ''}`}>
                <button
                  type="button"
                  className={styles.accordionHeader}
                  onClick={() => toggleAccordion(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${idx}`}
                  id={`faq-btn-${idx}`}
                >
                  <span className={styles.questionText}>{item.question}</span>
                  <ChevronDown
                    size={20}
                    className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`}
                    aria-hidden="true"
                  />
                </button>
                
                <div
                  id={`faq-content-${idx}`}
                  className={styles.accordionContentWrapper}
                  role="region"
                  aria-labelledby={`faq-btn-${idx}`}
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                  }}
                >
                  <div className={styles.accordionContent}>
                    <p className={styles.answerText}>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
