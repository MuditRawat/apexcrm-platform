import React from 'react';
import { GitMerge, MessageSquare, Brain, BarChart3, ShieldCheck, Globe } from 'lucide-react';
import { Card } from '../ui/Card/Card';
import styles from './Features.module.css';

export const Features: React.FC = () => {
  const featuresList = [
    {
      icon: <GitMerge size={24} className={styles.iconBlue} />,
      title: 'Pipeline Automation',
      description: 'Drag, drop, done. Build visual deal-flow pipelines that assign reps, trigger follow-ups, and log communications automatically without lifting a finger.',
    },
    {
      icon: <MessageSquare size={24} className={styles.iconIndigo} />,
      title: 'Contact Timelines',
      description: 'Every interaction compiled into one clean chronologic stream. View email history, phone transcripts, and Slack pings directly inside your contact details.',
    },
    {
      icon: <Brain size={24} className={styles.iconPurple} />,
      title: 'Apex Intelligence AI',
      description: 'Leverage native AI to draft emails, summarize sales calls, surface risks, and predict your deal closing probability with outstanding accuracy.',
    },
    {
      icon: <BarChart3 size={24} className={styles.iconPink} />,
      title: 'Advanced Analytics',
      description: 'Build customizable metrics and forecast reports. Monitor quarterly targets, pipeline velocity, team quotas, and ARR growth with live visual charts.',
    },
    {
      icon: <ShieldCheck size={24} className={styles.iconGreen} />,
      title: 'Enterprise-Grade Security',
      description: 'Rest easy with robust, SOC 2 Type II compliant controls. Configure multi-tenant role permissions, SSO integration, and comprehensive audit logging.',
    },
    {
      icon: <Globe size={24} className={styles.iconCyan} />,
      title: 'Global Scale Integration',
      description: 'Operate internationally with multi-currency sales booking, localized tax support, automated timezone tracking, and global translation engines.',
    },
  ];

  return (
    <section className={styles.featuresSection} id="features">
      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Everything you need to <span className={styles.highlight}>accelerate growth</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Engineered to replace bloated legacy CRM systems with a lightning-fast interface, automated workflows, and AI assistance.
          </p>
        </div>

        {/* Features Grid */}
        <div className={styles.grid}>
          {featuresList.map((feature, idx) => (
            <Card
              key={idx}
              variant="default"
              hoverable={true}
              padding="lg"
              className={styles.featureCard}
            >
              <div className={styles.iconWrapper} aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
