import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import styles from './ScrollToTop.module.css';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [footerVisibleHeight, setFooterVisibleHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle button visibility
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Check visibility of the footer's bottom bar to prevent overlapping
      const footerBottomBar = document.querySelector('footer > div:last-child');
      if (footerBottomBar) {
        const rect = footerBottomBar.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.top < viewportHeight) {
          // Bottom bar is visible, calculate how many pixels of it are shown
          const visibleAmount = viewportHeight - rect.top;
          // Add a small extra gap (e.g., 8px) for better breathing room
          setFooterVisibleHeight(visibleAmount + 8);
        } else {
          setFooterVisibleHeight(0);
        }
      } else {
        setFooterVisibleHeight(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`}
      style={{
        '--footer-shift': `${footerVisibleHeight}px`
      } as React.CSSProperties}
      aria-label="Scroll back to top of page"
    >
      <ArrowUp size={20} />
    </button>
  );
};
