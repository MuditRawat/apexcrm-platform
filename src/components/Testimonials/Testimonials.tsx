import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '../ui/Card/Card';
import styles from './Testimonials.module.css';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "ApexCRM dragged our sales team out of spreadsheet hell. Our reps are saving an average of 6 hours per week on manual logs, and overall pipeline velocity is up 38%. Unbelievable.",
      author: "Sarah Jenkins",
      role: "VP of Global Sales",
      company: "Vercel",
      stars: 5,
      avatarInitials: "SJ",
      avatarColor: "#4f46e5",
    },
    {
      quote: "As an engineering co-founder, I usually despise clunky CRM systems. Apex is the exact opposite. It's lightning fast, supports smooth keyboard shortcuts, and features the most logical REST API we have integrated yet.",
      author: "David Chen",
      role: "Co-Founder & CTO",
      company: "Linear",
      stars: 5,
      avatarInitials: "DC",
      avatarColor: "#64748b",
    },
    {
      quote: "Onboarding our team was virtually instantaneous. We migrated over 18,000 active contacts and history from our previous legacy CRM in under two hours. The unified contact timeline is brilliant.",
      author: "Elena Rostova",
      role: "Director of RevOps",
      company: "Notion",
      stars: 5,
      avatarInitials: "ER",
      avatarColor: "#ec4899",
    },
    {
      quote: "The predictive deal scoring powered by Apex AI is not just a marketing gimmick. It flagged three high-value accounts that were slipping and helped us secure them, single-handedly paying for our annual subscription.",
      author: "Marcus Brody",
      role: "Head of Growth",
      company: "Retool",
      stars: 5,
      avatarInitials: "MB",
      avatarColor: "#06b6d4",
    },
  ];

  return (
    <section className={styles.testimonialSection} id="testimonials">
      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Loved by high-growth <span className={styles.highlight}>sales teams</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            See how scaling software companies use ApexCRM to align operations, automate outbound efforts, and hit quarterly targets.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className={styles.grid}>
          {testimonials.map((test, idx) => (
            <Card
              key={test.author}
              variant="default"
              hoverable={true}
              padding="lg"
              className={styles.testimonialCard}
            >
              {/* Star Rating */}
              <div className={styles.starsWrapper} aria-label={`${test.stars} out of 5 stars`}>
                {[...Array(test.stars)].map((_, sIdx) => (
                  <Star key={sIdx} size={16} className={styles.starIcon} fill="currentColor" />
                ))}
              </div>

              {/* Quote Block */}
              <blockquote className={styles.quote}>
                “{test.quote}”
              </blockquote>

              {/* Author Info */}
              <div className={styles.authorContainer}>
                <div
                  className={styles.avatar}
                  style={{ backgroundColor: test.avatarColor } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {test.avatarInitials}
                </div>
                <div className={styles.authorMeta}>
                  <cite className={styles.authorName}>{test.author}</cite>
                  <p className={styles.authorRole}>
                    {test.role}, <span className={styles.companyName}>{test.company}</span>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
