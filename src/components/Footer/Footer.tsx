import React from 'react';
import { Mail, MapPin, Phone, Github, Linkedin, Lock } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const companyLinks = [
    { label: 'About ApexCRM', href: '#hero' },
    { label: 'Contact Sales', href: '#contact' },
  ];

  return (
    <footer className={styles.footer} aria-label="Site Footer">
      <div className={`${styles.container} container`}>
        {/* Brand & Address Section */}
        <div className={styles.brandCol}>
          <a href="#hero" className={styles.logo} aria-label="ApexCRM Home">
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className={styles.logoText}>ApexCRM</span>
          </a>
          <p className={styles.brandDesc}>
            The next-generation CRM designed to automate sales workflows, compile unified communication timelines, and supercharge deal close rates.
          </p>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Mail size={16} className={styles.contactIcon} />
              <a href="mailto:sales@apexcrm.co" className={styles.contactLink}>sales@apexcrm.co</a>
            </div>
            <div className={styles.contactItem}>
              <Phone size={16} className={styles.contactIcon} />
              <a href="tel:+15551928340" className={styles.contactLink}>+1 (555) 192-8340</a>
            </div>
            <div className={styles.contactItem}>
              <MapPin size={16} className={styles.contactIcon} style={{ alignSelf: 'flex-start', marginTop: '2px' }} />
              <address className={styles.address}>
                548 Market St, Suite 89201<br />
                San Francisco, CA 94104
              </address>
            </div>
          </div>
        </div>

        {/* Link Columns */}
        <div className={styles.linksGrid}>
          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Product</h4>
            <nav className={styles.nav} aria-label="Footer Product Links">
              {productLinks.map((link, idx) => (
                <a key={idx} href={link.href} className={styles.footerLink}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Company</h4>
            <nav className={styles.nav} aria-label="Footer Company Links">
              {companyLinks.map((link, idx) => (
                <a key={idx} href={link.href} className={styles.footerLink}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar with copyright and social */}
      <div className={styles.bottomBar}>
        <div className={`${styles.bottomContainer} container`}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <p className={styles.copyright}>
              &copy; {currentYear} ApexCRM, Inc. All rights reserved.
            </p>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem', display: 'inline-block' }} className="hidden md:inline">•</span>
            <a href="#admin" className={styles.adminLink}>
              <Lock size={12} style={{ marginRight: '0.35rem' }} />
              Admin Portal
            </a>
          </div>
          <div className={styles.socialWrapper} aria-label="Social media profiles">
            <a 
              href="https://github.com/MuditRawat/apexcrm-platform" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink} 
              aria-label="View Project on GitHub"
            >
              <Github size={18} />
            </a>
            <a 
              href="https://www.linkedin.com/in/mudit-rawat-15b36b37a" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink} 
              aria-label="Connect on LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
