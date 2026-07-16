import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card/Card';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../services/supabase';
import styles from './InquiryForm.module.css';

interface FormState {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  companySize: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  country?: string;
  industry?: string;
  companySize?: string;
  message?: string;
}

const phonePlaceholders: Record<string, string> = {
  us: '+1 (555) 019-2834',
  ca: '+1 (555) 987-6543',
  uk: '+44 7911 123456',
  au: '+61 412 345 678',
  de: '+49 151 23456789',
  fr: '+33 6 1234 5678',
  in: '+91 98765 43210',
  sg: '+65 8123 4567',
  jp: '+81 90 1234 5678',
  other: '+1 (555) 019-2834',
};

export const InquiryForm: React.FC = () => {
  const { showToast } = useToast();
  
  const initialFormState: FormState = {
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    country: '',
    industry: '',
    companySize: '',
    message: '',
  };

  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);
  
  // Listen for pricing plan selections to pre-populate message
  useEffect(() => {
    const handlePlanSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ plan: string }>;
      const planName = customEvent.detail?.plan;
      if (planName) {
        setForm((prev) => {
          let prefilledMessage = `I would like to start a 14-day free trial on the ${planName} Plan. `;
          if (planName === 'Enterprise') {
            prefilledMessage = `I am interested in scheduling a live demo and receiving custom pricing details for the ${planName} Plan. `;
          }
          return {
            ...prev,
            message: `${prefilledMessage}We are looking to migrate our current pipeline setup and get our team onboarded.`,
          };
        });
        
        // Clear message validation error if it exists
        setErrors((prev) => ({ ...prev, message: undefined }));
      }
    };

    window.addEventListener('select-pricing-plan', handlePlanSelect);
    return () => {
      window.removeEventListener('select-pricing-plan', handlePlanSelect);
    };
  }, []);

  // Field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    
    // Clear field error as soon as user types
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  // Extensive validation rules
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Full Name
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    // Company Name
    if (!form.companyName.trim()) {
      newErrors.companyName = 'Company Name is required.';
    }

    // Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@company.com).';
    }

    // Phone Number
    // Simple phone regex supporting +, dashes, dots, spaces, parentheses, and 7-20 characters
    const phoneRegex = /^\+?[0-9\s\-()\.]{7,20}$/;
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    // Country Select
    if (!form.country) {
      newErrors.country = 'Please select a country.';
    }

    // Industry Select
    if (!form.industry) {
      newErrors.industry = 'Please select an industry.';
    }

    // Company Size Select
    if (!form.companySize) {
      newErrors.companySize = 'Please select your company size.';
    }

    // Message
    if (!form.message.trim()) {
      newErrors.message = 'Please provide a brief message of your goals.';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return newErrors;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      showToast({
        type: 'error',
        title: 'Form Validation Error',
        message: 'Please resolve the highlighted field errors and try again.',
      });

      // Form invalid, focus first error input
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorEl = document.getElementById(firstErrorField);
      if (errorEl) {
        errorEl.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload variations to match whatever naming convention is used in Supabase
      const snakeCaseData = {
        full_name: form.fullName,
        company_name: form.companyName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        industry: form.industry,
        company_size: form.companySize,
        message: form.message,
      };

      const camelCaseData = {
        fullName: form.fullName,
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        industry: form.industry,
        companySize: form.companySize,
        message: form.message,
      };

      // Table options we can try inserting to (most common names for CRM contact tables)
      const tablesToTry = ['inquiries', 'contact_sales', 'submissions', 'contacts'];
      let lastError: any = null;
      let isInserted = false;

      for (const tableName of tablesToTry) {
        // Try snake_case insertion first (highly recommended default for Supabase and Postgres)
        const { error: snakeError } = await supabase
          .from(tableName)
          .insert([snakeCaseData]);

        if (!snakeError) {
          isInserted = true;
          break;
        }

        // Check if the error code is '42P01' (relation/table does not exist in Postgres)
        const isTableMissing = (snakeError as any)?.code === '42P01';

        if (!isTableMissing) {
          // Table exists, but snake_case columns failed. Let's try camelCase columns
          const { error: camelError } = await supabase
            .from(tableName)
            .insert([camelCaseData]);

          if (!camelError) {
            isInserted = true;
            break;
          }
          lastError = camelError;
        } else {
          lastError = snakeError;
        }
      }

      if (!isInserted) {
        throw lastError || new Error('All destination tables could not be found or column layout did not match.');
      }

      setSubmitResult('success');
      showToast({
        type: 'success',
        title: 'Inquiry Sent Successfully',
        message: 'Thanks! Your inquiry has been saved in our system and an advisor will contact you within 2 hours.',
      });
      setForm(initialFormState); // clear on success
    } catch (error: any) {
      console.error('Supabase submission failure details:', error);
      setSubmitResult('error');
      showToast({
        type: 'error',
        title: 'Connection Failure',
        message: error?.message || 'A network connection error occurred while submitting your inquiry. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset after success/error review
  const handleReset = () => {
    setSubmitResult(null);
  };

  // Dropdown list contents
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'in', label: 'India' },
    { value: 'sg', label: 'Singapore' },
    { value: 'jp', label: 'Japan' },
    { value: 'other', label: 'Other Country' },
  ];

  const industries = [
    { value: 'tech', label: 'Software & Technology' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare & Life Sciences' },
    { value: 'ecommerce', label: 'E-commerce & Retail' },
    { value: 'consulting', label: 'Professional Consulting' },
    { value: 'realestate', label: 'Real Estate' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other Industry' },
  ];

  const companySizes = [
    { value: '1-10', label: '1 - 10 employees' },
    { value: '11-50', label: '11 - 50 employees' },
    { value: '51-200', label: '51 - 200 employees' },
    { value: '201-500', label: '201 - 500 employees' },
    { value: '501-1000', label: '501 - 1,000 employees' },
    { value: '1000+', label: '1,000+ employees' },
  ];

  return (
    <section className={styles.contactSection} id="contact">
      <div className={`${styles.container} container`}>
        {/* Header Block */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Ready to <span className={styles.highlight}>scale your sales</span> pipeline?
          </h2>
          <p className={styles.sectionSubtitle}>
            Get in touch with our product team to secure custom pricing, request a personalized live demo, or ask about multi-user onboarding credits.
          </p>
        </div>

        {/* Contact Layout: Left Info, Right Card Form */}
        <div className={styles.layoutGrid}>
          {/* Left Side: Copy & Features */}
          <div className={styles.infoColumn}>
            <h3 className={styles.infoTitle}>Why partner with ApexCRM?</h3>
            <p className={styles.infoDesc}>
              Our enterprise advisory and customer success team will support your migration from outdated Salesforce or HubSpot setups to our lightning-fast ecosystem.
            </p>

            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>
                <div className={styles.benefitMarker} aria-hidden="true">✓</div>
                <div>
                  <h4 className={styles.benefitTitle}>Onboarding Advisor Included</h4>
                  <p className={styles.benefitDesc}>Get a dedicated success coach to import CSV data and map workflow transitions.</p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <div className={styles.benefitMarker} aria-hidden="true">✓</div>
                <div>
                  <h4 className={styles.benefitTitle}>SLA Uptime Guarantees</h4>
                  <p className={styles.benefitDesc}>We provide a legally binding 99.99% uptime service level agreement for our enterprise clients.</p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <div className={styles.benefitMarker} aria-hidden="true">✓</div>
                <div>
                  <h4 className={styles.benefitTitle}>Custom integrations support</h4>
                  <p className={styles.benefitDesc}>Need bespoke webhook handling or custom UI integrations? Our engineers are ready to build it.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right Side: Form Card */}
          <Card variant="featured" padding="lg" className={styles.formCard}>
            {submitResult === 'success' && (
              <div className={styles.statusView} role="status">
                <CheckCircle size={56} className={styles.successIcon} />
                <h3 className={styles.statusTitle}>Inquiry Sent Successfully!</h3>
                <p className={styles.statusText}>
                  Thank you for contacting ApexCRM. Our enterprise advisory specialist has received your request and will contact you within the next 2 hours.
                </p>
                <Button variant="outline" size="md" onClick={handleReset} className="mt-4">
                  Send Another Message
                </Button>
              </div>
            )}

            {submitResult === 'error' && (
              <div className={styles.statusView} role="status">
                <AlertCircle size={56} className={styles.errorIcon} />
                <h3 className={styles.statusTitle}>Submission Failure</h3>
                <p className={styles.statusText}>
                  A network connection error occurred while submitting your inquiry. Please try again or contact our support team if the issue persists.
                </p>
                <Button variant="primary" size="md" onClick={handleReset} className="mt-4">
                  <RefreshCw size={16} /> Retry Submission
                </Button>
              </div>
            )}

            {!submitResult && (
              <>
                <div className={styles.formHeader}>
                  <h3 className={styles.formTitle}>Contact Sales</h3>
                  <p className={styles.formSubtitle}>
                    Submit your details and an enterprise specialist will follow up with you.
                  </p>
                </div>
                <form onSubmit={handleSubmit} noValidate className={styles.form}>
                <div className={styles.formGrid}>
                  <Input
                    label="Full Name"
                    id="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    placeholder="Jane Doe"
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Company Name"
                    id="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                    placeholder="Acme Corp"
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="jane@company.com"
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Phone Number"
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder={phonePlaceholders[form.country] || '+1 (555) 019-2834'}
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Country"
                    id="country"
                    as="select"
                    value={form.country}
                    onChange={handleChange}
                    error={errors.country}
                    options={countries}
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Industry"
                    id="industry"
                    as="select"
                    value={form.industry}
                    onChange={handleChange}
                    error={errors.industry}
                    options={industries}
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="Company Size"
                    id="companySize"
                    as="select"
                    value={form.companySize}
                    onChange={handleChange}
                    error={errors.companySize}
                    options={companySizes}
                    required
                    disabled={isSubmitting}
                    className={styles.fullWidthField}
                  />

                  <Input
                    label="Tell us about your goals"
                    id="message"
                    as="textarea"
                    value={form.message}
                    onChange={handleChange}
                    error={errors.message}
                    placeholder="Briefly share details about your team pipelines, current CRM headaches, and onboarding timeline..."
                    required
                    disabled={isSubmitting}
                    className={styles.fullWidthField}
                  />
                </div>

                <div className={styles.submitContainer}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className={styles.submitButton}
                    isLoading={isSubmitting}
                  >
                    Submit Inquiry <Send size={16} />
                  </Button>
                </div>
              </form>
            </>
          )}
          </Card>
        </div>
      </div>
    </section>
  );
};
