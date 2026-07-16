import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import { Features } from './components/Features/Features';
import { Pricing } from './components/Pricing/Pricing';
import { Testimonials } from './components/Testimonials/Testimonials';
import { FAQ } from './components/FAQ/FAQ';
import { InquiryForm } from './components/InquiryForm/InquiryForm';
import { Footer } from './components/Footer/Footer';
import { ScrollToTop } from './components/ui/ScrollToTop/ScrollToTop';
import { AdminPortal } from './components/Admin/AdminPortal';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#') {
        window.location.hash = '#hero';
        return;
      }
      if (hash === '#admin') {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'instant' as any });
      } else {
        setCurrentView('landing');
        if (hash && hash !== '#') {
          const id = hash.substring(1);
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          } else {
            // Retry in case DOM element rendering is deferred
            const timer = setTimeout(() => {
              const el = document.getElementById(id);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
            return () => clearTimeout(timer);
          }
        }
      }
    };

    // Initialize on load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
          {currentView === 'admin' ? (
            <AdminPortal />
          ) : (
            <>
              <Navbar />
              <main style={{ flexGrow: 1 }}>
                <Hero />
                <Features />
                <Pricing />
                <Testimonials />
                <FAQ />
                <InquiryForm />
              </main>
              <Footer />
              <ScrollToTop />
            </>
          )}
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
