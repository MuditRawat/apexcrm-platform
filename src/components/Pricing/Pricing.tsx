import React, { useState } from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card/Card';
import { Button } from '../ui/Button/Button';
import styles from './Pricing.module.css';

export const Pricing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');

  const handlePlanSelect = (planName: string) => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Dispatch custom event to pre-populate the inquiry form
    const event = new CustomEvent('select-pricing-plan', { detail: { plan: planName } });
    window.dispatchEvent(event);
  };

  const plans = [
    {
      name: 'Starter',
      tagline: 'Essential contact tracking for small sales teams.',
      price: billingPeriod === 'annual' ? 29 : 35,
      features: [
        'Up to 5 active sales pipelines',
        'Basic contact timelines & email integration',
        'Standard dashboard analytics',
        'Google Workspace integration',
        'Standard email support (24hr response)',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      tagline: 'Advanced automation & intelligence for scaling teams.',
      price: billingPeriod === 'annual' ? 79 : 95,
      features: [
        'Unlimited active sales pipelines',
        'Fully automated email & transcript sync',
        'Apex Intelligence AI assistance (drafts & summaries)',
        'Custom dashboard & metrics builder',
        'Priority email & chat support (4hr response)',
        'Up to 50 active workflow automations',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      tagline: 'Custom controls & dedicated support for enterprise scale.',
      price: billingPeriod === 'annual' ? 149 : 175,
      features: [
        'Everything in Professional plan',
        'Dedicated success manager & onboarding training',
        'Enterprise SAML SSO & row-level permissions',
        'Custom developer API & webhooks access',
        'Uptime SLA guarantee & unlimited workflows',
        'Custom contract & localized compliance support',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false,
    },
  ];

  return (
    <section className={styles.pricingSection} id="pricing">
      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Simple, <span className={styles.highlight}>transparent</span> pricing
          </h2>
          <p className={styles.sectionSubtitle}>
            Choose the plan that fits your current scale. All plans include a 14-day trial period with no credit card required.
          </p>

          {/* Monthly/Annual Toggle Switch */}
          <div className={styles.toggleContainer}>
            <button
              className={`${styles.toggleBtn} ${billingPeriod === 'monthly' ? styles.toggleActive : ''}`}
              onClick={() => setBillingPeriod('monthly')}
              aria-label="Switch to monthly billing"
            >
              Billed Monthly
            </button>
            <button
              className={`${styles.toggleBtn} ${billingPeriod === 'annual' ? styles.toggleActive : ''}`}
              onClick={() => setBillingPeriod('annual')}
              aria-label="Switch to annual billing"
            >
              Billed Annually
              <span className={styles.saveBadge}>Save ~20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={styles.grid}>
          {plans.map((plan, idx) => (
            <Card
              key={plan.name}
              variant={plan.popular ? 'featured' : 'default'}
              hoverable={true}
              padding="lg"
              className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''}`}
            >
              {plan.popular && (
                <span className={styles.popularBadge} aria-hidden="true">
                  Most Popular
                </span>
              )}

              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planTagline}>{plan.tagline}</p>
                
                <div className={styles.priceContainer}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.price}>{plan.price}</span>
                  <span className={styles.period}>/user/month</span>
                </div>
                {billingPeriod === 'annual' && (
                  <p className={styles.billingAnnually}>Billed annually</p>
                )}
              </div>

              <div className={styles.divider} />

              <ul className={styles.featuresList} aria-label={`Features included in ${plan.name} plan`}>
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className={styles.featureItem}>
                    <span className={styles.checkIconWrapper}>
                      <Check size={14} className={styles.checkIcon} />
                    </span>
                    <span className={styles.featureText}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.ctaWrapper}>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="md"
                  className={styles.ctaButton}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
