import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Users, 
  LogOut, 
  Search, 
  Download, 
  RefreshCw, 
  SlidersHorizontal, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  Database,
  Copy,
  Check,
  ChevronRight,
  Eye,
  Trash2
} from 'lucide-react';
import { Card } from '../ui/Card/Card';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../services/supabase';
import styles from './AdminPortal.module.css';

// Simple native SHA-256 password hashing helper
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

interface Inquiry {
  id: string | number;
  full_name?: string;
  fullName?: string;
  company_name?: string;
  companyName?: string;
  email: string;
  phone?: string;
  country?: string;
  industry?: string;
  company_size?: string;
  companySize?: string;
  message?: string;
  created_at: string;
  status?: string;
}

export const AdminPortal: React.FC = () => {
  const { showToast } = useToast();
  
  // App States
  const [isAdminCreated, setIsAdminCreated] = useState<boolean | null>(null);
  const [isDbError, setIsDbError] = useState<boolean>(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string>('');
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Session State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('apexcrm_admin_logged_in') === 'true';
  });
  const [adminUser, setAdminUser] = useState<string | null>(() => {
    return sessionStorage.getItem('apexcrm_admin_email');
  });

  // Dashboard Data State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTableName, setActiveTableName] = useState<string>('inquiries');
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const sqlScript = `-- Create inquiries table
create table if not exists inquiries (
  id bigint generated always as identity primary key,
  full_name text not null,
  company_name text,
  email text not null,
  phone text,
  country text,
  industry text,
  company_size text,
  message text,
  status text default 'New' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure inquiries table has status column if already created
alter table inquiries add column if not exists status text default 'New' not null;

-- Backfill any existing rows with NULL status to 'New'
update inquiries set status = 'New' where status is null;

-- Create admin_users table
create table if not exists admin_users (
  id bigint generated always as identity primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable Row Level Security (RLS) for easy development connection
alter table inquiries disable row level security;
alter table admin_users disable row level security;

-- FORCE REFRESH SCHEMA CACHE: Run this command in your Supabase SQL Editor
-- if your client does not immediately detect the newly added columns:
NOTIFY pgrst, 'reload schema';`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    showToast({
      type: 'success',
      title: 'SQL Copied',
      message: 'Database setup script has been copied to your clipboard.',
    });
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Check if admin_users exists and if an admin is already registered
  const checkAdminStatus = async () => {
    setIsCheckingAdmin(true);
    setIsDbError(false);
    try {
      const { data, error, count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact' });

      if (error) {
        // Table doesn't exist or permissions error
        if (error.code === '42P01') {
          setIsDbError(true);
          setDbErrorMessage("The table 'admin_users' was not found in your Supabase database. Please run the SQL initialization script.");
        } else {
          setIsDbError(true);
          setDbErrorMessage(error.message);
        }
        setIsAdminCreated(false);
      } else {
        const hasAdmin = (count !== null && count > 0) || (data && data.length > 0);
        setIsAdminCreated(hasAdmin);
      }
    } catch (e: any) {
      console.error(e);
      setIsDbError(true);
      setDbErrorMessage(e.message || 'Unknown network error checking Supabase connection.');
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Fetch Inquiries
  const fetchInquiries = async () => {
    if (!isLoggedIn) return;
    setIsLoadingInquiries(true);
    
    const tablesToTry = ['inquiries', 'contact_sales', 'submissions', 'contacts'];
    let fetchedData: Inquiry[] = [];
    let fetchSuccess = false;
    let finalError = null;

    for (const tableName of tablesToTry) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: sortOrder === 'asc' });

        if (!error && data) {
          fetchedData = data;
          fetchSuccess = true;
          setActiveTableName(tableName);
          break;
        }
        if (error && error.code !== '42P01') {
          finalError = error;
        }
      } catch (err) {
        console.error(`Error querying table ${tableName}:`, err);
      }
    }

    if (fetchSuccess) {
      const processedData = fetchedData.map(inq => {
        // If status is undefined, null, or doesn't exist, load it from localStorage fallback
        const hasStatusInDb = inq.hasOwnProperty('status') && inq.status !== null && inq.status !== undefined;
        if (!hasStatusInDb) {
          const localStatus = localStorage.getItem(`inquiry_status_${inq.id}`);
          return { ...inq, status: localStatus || 'New' };
        }
        return inq;
      });

      setInquiries(processedData);
      
      // Keep selected inquiry in sync with fetched data
      if (selectedInquiry) {
        const updatedSelected = processedData.find(inq => inq.id === selectedInquiry.id);
        if (updatedSelected) {
          setSelectedInquiry(updatedSelected);
        } else {
          setSelectedInquiry(null);
        }
      }
    } else {
      showToast({
        type: 'error',
        title: 'Failed to Fetch Inquiries',
        message: finalError?.message || "Could not find standard inquiry tables. Check your database setup.",
      });
    }
    setIsLoadingInquiries(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchInquiries();
    }
  }, [isLoggedIn, sortOrder]);

  // Refs and hooks for the accessible Delete Confirmation Modal
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (inquiryToDelete) {
      // Prevent body scrolling while modal is open
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Auto-focus the non-destructive Cancel button for keyboard navigation safety
      const focusTimer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);

      // Dismiss on Escape key press
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setInquiryToDelete(null);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalStyle;
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(focusTimer);
      };
    }
  }, [inquiryToDelete]);

  // Handle select inquiry with auto-view status update
  const handleSelectInquiry = async (lead: Inquiry) => {
    setSelectedInquiry(lead);
    
    // If status is New (or undefined/null), automatically update it to 'Viewed'
    const currentStatus = lead.status || 'New';
    if (currentStatus === 'New') {
      // Save fallback in localStorage immediately
      localStorage.setItem(`inquiry_status_${lead.id}`, 'Viewed');

      // Optimistically update local state first for immediate UI responsiveness
      setInquiries(prev => prev.map(inq => inq.id === lead.id ? { ...inq, status: 'Viewed' } : inq));
      setSelectedInquiry(prev => prev && prev.id === lead.id ? { ...prev, status: 'Viewed' } : prev);
      
      try {
        const { error } = await supabase
          .from(activeTableName)
          .update({ status: 'Viewed' })
          .eq('id', lead.id);

        if (error) {
          if (error.code === 'PGRST204') {
            // Missing status column in schema cache - swallow error and keep using localStorage fallback
            console.warn("Status column not found in database schema, using localStorage fallback.");
          } else {
            // Real database error - revert local state and show error toast
            setInquiries(prev => prev.map(inq => inq.id === lead.id ? { ...inq, status: 'New' } : inq));
            setSelectedInquiry(prev => prev && prev.id === lead.id ? { ...prev, status: 'New' } : prev);
            localStorage.setItem(`inquiry_status_${lead.id}`, 'New');
            
            showToast({
              type: 'error',
              title: 'Failed to Update Status',
              message: error.message || 'Database error while marking inquiry as viewed.',
            });
          }
        }
      } catch (err: any) {
        console.error('Error updating status:', err);
      }
    }
  };

  // Delete handlers
  const handleDeleteClick = (lead: Inquiry) => {
    setInquiryToDelete(lead);
  };

  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from(activeTableName)
        .delete()
        .eq('id', inquiryToDelete.id);

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'Inquiry Deleted',
        message: 'The inquiry has been permanently removed from the system.',
      });

      // Clear selection if deleted inquiry was selected
      if (selectedInquiry && selectedInquiry.id === inquiryToDelete.id) {
        setSelectedInquiry(null);
      }

      setInquiryToDelete(null);
      
      // Refresh list automatically
      await fetchInquiries();
    } catch (err: any) {
      console.error('Failed to delete inquiry:', err);
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'An error occurred while deleting the inquiry.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Create Admin (The single allowed account slot)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      showToast({ type: 'error', title: 'Input Error', message: 'All fields are required.' });
      return;
    }
    if (password !== confirmPassword) {
      showToast({ type: 'error', title: 'Input Error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      showToast({ type: 'error', title: 'Input Error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsAuthLoading(true);
    try {
      // Re-verify count right before sign up
      const { count, error: countErr } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      if (countErr) throw countErr;

      if (count && count > 0) {
        showToast({
          type: 'error',
          title: 'Registration Locked',
          message: 'An admin account already exists. Only one admin slot is allowed.',
        });
        setIsAdminCreated(true);
        setIsAuthLoading(false);
        return;
      }

      const hash = await sha256(password);
      const { error: insertErr } = await supabase
        .from('admin_users')
        .insert([{ email: email.toLowerCase().trim(), password_hash: hash }]);

      if (insertErr) throw insertErr;

      showToast({
        type: 'success',
        title: 'Admin Created',
        message: 'Your administrator account has been successfully created.',
      });
      
      // Auto login
      sessionStorage.setItem('apexcrm_admin_logged_in', 'true');
      sessionStorage.setItem('apexcrm_admin_email', email);
      setIsLoggedIn(true);
      setAdminUser(email);
      setIsAdminCreated(true);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to create admin user.',
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast({ type: 'error', title: 'Input Error', message: 'Email and password are required.' });
      return;
    }

    setIsAuthLoading(true);
    try {
      const hash = await sha256(password);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password_hash', hash);

      if (error) throw error;

      if (data && data.length > 0) {
        showToast({
          type: 'success',
          title: 'Welcome back',
          message: 'Admin session started successfully.',
        });
        sessionStorage.setItem('apexcrm_admin_logged_in', 'true');
        sessionStorage.setItem('apexcrm_admin_email', email);
        setIsLoggedIn(true);
        setAdminUser(email);
      } else {
        showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'Invalid email or password combination.',
        });
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Authentication Error',
        message: error.message || 'An error occurred during verification.',
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem('apexcrm_admin_logged_in');
    sessionStorage.removeItem('apexcrm_admin_email');
    setIsLoggedIn(false);
    setAdminUser(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    showToast({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been safely signed out.',
    });
  };

  // CSV Export Utility
  const exportToCsv = () => {
    if (inquiries.length === 0) return;

    const headers = ['ID', 'Date', 'Full Name', 'Company Name', 'Email', 'Phone', 'Country', 'Industry', 'Company Size', 'Message'];
    const rows = inquiries.map(item => [
      item.id,
      new Date(item.created_at).toLocaleString(),
      item.full_name || item.fullName || '',
      item.company_name || item.companyName || '',
      item.email,
      item.phone || '',
      item.country || '',
      item.industry || '',
      item.company_size || item.companySize || '',
      (item.message || '').replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apexcrm_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search computation
  const filteredInquiries = inquiries.filter(item => {
    const name = (item.full_name || item.fullName || '').toLowerCase();
    const emailStr = (item.email || '').toLowerCase();
    const company = (item.company_name || item.companyName || '').toLowerCase();
    const industry = (item.industry || '').toLowerCase();
    const size = (item.company_size || item.companySize || '').toLowerCase();
    const message = (item.message || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = 
      name.includes(query) || 
      emailStr.includes(query) || 
      company.includes(query) || 
      industry.includes(query) ||
      message.includes(query);

    const matchesIndustry = !industryFilter || industry === industryFilter.toLowerCase();
    const matchesSize = !sizeFilter || size === sizeFilter.toLowerCase();

    return matchesSearch && matchesIndustry && matchesSize;
  });

  // Extract unique industries & company sizes for filter dropdowns
  const uniqueIndustries = Array.from(
    new Set(inquiries.map(i => i.industry).filter(Boolean))
  ) as string[];

  const uniqueSizes = Array.from(
    new Set(inquiries.map(i => i.company_size || i.companySize).filter(Boolean))
  ) as string[];

  // Database Connection Error View
  if (isDbError) {
    return (
      <div className={styles.authWrapper}>
        <Card variant="default" padding="lg" className={styles.sqlCard}>
          <div className={styles.errorHeader}>
            <Database size={40} className={styles.dbIcon} />
            <h2 className={styles.sqlTitle}>Database Setup Required</h2>
            <p className={styles.sqlSubtitle}>{dbErrorMessage}</p>
          </div>

          <div className={styles.sqlInstructions}>
            <p className="mb-3">
              To activate the Admin Portal and the leads database, copy and paste the following schema in your <strong>Supabase SQL Editor</strong> and hit <strong>Run</strong>:
            </p>
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}><code>{sqlScript}</code></pre>
              <button 
                type="button" 
                onClick={copySqlToClipboard} 
                className={styles.copyBtn}
                title="Copy SQL Script"
              >
                {copiedSql ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                <span>{copiedSql ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="secondary" onClick={checkAdminStatus}>
                <RefreshCw size={15} className="mr-2" /> Retry Connection
              </Button>
              <Button variant="outline" onClick={() => window.location.hash = '#'}>
                Return to Site
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Loading Initial Verification State
  if (isCheckingAdmin) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.loadingPulse}>
          <div className={styles.spinnerPulse}></div>
          <p>Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  // RENDER: Auth Forms (Login / Create Account)
  if (!isLoggedIn) {
    return (
      <div className={styles.authWrapper}>
        <Card variant="featured" padding="lg" className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.logoBadge}>
              <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className={styles.authTitle}>
              {isAdminCreated ? 'Administrator Sign In' : 'Setup Administrator Account'}
            </h2>
            <p className={styles.authSubtitle}>
              {isAdminCreated 
                ? 'Authorized access only. Your login session will be encrypted.' 
                : 'Registration slot is open. Once created, registration closes and locks.'}
            </p>
          </div>

          {!isAdminCreated ? (
            /* REGISTRATION FORM (THE SINGLE ALLOWED SLOT) */
            <form onSubmit={handleSignUp} className={styles.authForm}>
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Create Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button variant="primary" type="submit" isLoading={isAuthLoading} className="w-full mt-4">
                Initialize Admin Portal
              </Button>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className={styles.authForm}>
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button variant="primary" type="submit" isLoading={isAuthLoading} className="w-full mt-4">
                Access Admin Dashboard
              </Button>
              
              <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p className="font-semibold mb-2 text-slate-800 dark:text-slate-200">
                  To make testing easier, admin credentials are provided below:
                </p>
                <div className="space-y-1 font-mono">
                  <div>
                    <span className="font-sans text-slate-500">Email:</span>{' '}
                    <span className="text-slate-900 dark:text-slate-100 font-semibold select-all">muditrawat@gmail.com</span>
                  </div>
                  <div>
                    <span className="font-sans text-slate-500">Password:</span>{' '}
                    <span className="text-slate-900 dark:text-slate-100 font-semibold select-all">mudit123</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEmail('muditrawat@gmail.com');
                    setPassword('mudit123');
                    showToast({
                      type: 'success',
                      title: 'Credentials Pre-filled',
                      message: 'Admin credentials have been loaded. Click "Access Lead Management" to continue.',
                    });
                  }}
                  className="mt-3 w-full"
                >
                  Auto-fill Credentials
                </Button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <button 
              type="button" 
              onClick={() => window.location.hash = '#'} 
              className={styles.backToSite}
            >
              ← Back to main website
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // RENDER: LOGGED IN LEADS DASHBOARD
  return (
    <div className={styles.dashboardContainer}>
      {/* Dashboard Top Navigation */}
      <header className={styles.dbHeader}>
        <div className={styles.dbHeaderContainer}>
          <div className={styles.dbBranding}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className={styles.dbBrandingText}>ApexCRM</span>
            <span className={styles.dbBadge}>Admin Portal</span>
          </div>

          <div className={styles.dbActions}>
            <div className={styles.sessionUser}>
              <User size={16} />
              <span>{adminUser}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={14} className="mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className={styles.dbMain}>
        {/* Top summary cards */}
        <div className={styles.statsGrid}>
          <Card variant="default" padding="md" className={styles.statsCard}>
            <div className={styles.statsIconWrapper}>
              <Users className="text-brand-primary" size={24} />
            </div>
            <div className={styles.statsInfo}>
              <span className={styles.statsLabel}>Total Inquiries</span>
              <h3 className={styles.statsVal}>{inquiries.length}</h3>
            </div>
          </Card>
          
          <Card variant="default" padding="md" className={styles.statsCard}>
            <div className={`${styles.statsIconWrapper} bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500`}>
              <Mail className="text-emerald-500" size={24} />
            </div>
            <div className={styles.statsInfo}>
              <span className={styles.statsLabel}>New Inquiries</span>
              <h3 className={styles.statsVal}>{inquiries.filter(i => (i.status || 'New') === 'New').length}</h3>
            </div>
          </Card>

          <Card variant="default" padding="md" className={styles.statsCard}>
            <div className={`${styles.statsIconWrapper} bg-slate-50 dark:bg-slate-800/30 text-slate-500`}>
              <Eye className="text-slate-500" size={24} />
            </div>
            <div className={styles.statsInfo}>
              <span className={styles.statsLabel}>Viewed Inquiries</span>
              <h3 className={styles.statsVal}>{inquiries.filter(i => i.status === 'Viewed').length}</h3>
            </div>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className={styles.controlPanel}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search leads by name, email, company, message..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filtersGroup}>
            <div className={styles.filterDropdownWrapper}>
              <Filter size={14} className={styles.dropdownIcon} />
              <select
                className={styles.filterSelect}
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                <option value="">All Industries</option>
                {uniqueIndustries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterDropdownWrapper}>
              <Briefcase size={14} className={styles.dropdownIcon} />
              <select
                className={styles.filterSelect}
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
              >
                <option value="">All Sizes</option>
                {uniqueSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <button 
              type="button"
              className={styles.sortToggle}
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            >
              <ArrowUpDown size={14} />
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>

            <button 
              type="button" 
              onClick={fetchInquiries} 
              className={styles.iconBtn}
              title="Refresh Leads"
              disabled={isLoadingInquiries}
            >
              <RefreshCw size={14} className={isLoadingInquiries ? 'animate-spin' : ''} />
            </button>

            <Button variant="primary" size="sm" onClick={exportToCsv} className={styles.exportBtn}>
              <Download size={14} className="mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Content Workspace Split */}
        <div className={styles.workspaceSplit}>
          {/* Left Panel: Table/List of Inquiries */}
          <div className={styles.leadsListCard}>
            {isLoadingInquiries ? (
              <div className={styles.tablePlaceholder}>
                <div className={styles.spinnerPulse}></div>
                <p className="mt-3 text-sm">Querying customer records...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className={styles.tablePlaceholder}>
                <Users size={48} className="text-slate-300 dark:text-slate-700" />
                <p className="mt-3 text-sm font-semibold">No Inquiries Found</p>
                <p className="text-xs text-slate-400">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.leadsTable}>
                  <thead>
                    <tr>
                      <th>Lead Contact</th>
                      <th>Company Detail</th>
                      <th>Attributes</th>
                      <th>Date Received</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((lead) => {
                      const name = lead.full_name || lead.fullName || 'Unknown';
                      const comp = lead.company_name || lead.companyName || 'Not Provided';
                      const size = lead.company_size || lead.companySize || '-';
                      return (
                        <tr 
                          key={lead.id} 
                          onClick={() => handleSelectInquiry(lead)}
                          className={selectedInquiry?.id === lead.id ? styles.activeRow : ''}
                        >
                          <td>
                            <div className={styles.leadCell}>
                              <span className={styles.leadName}>{name}</span>
                              <div className="flex items-center my-1">
                                {(lead.status || 'New') === 'New' ? (
                                  <span 
                                    className={`${styles.statusBadge} whitespace-nowrap flex-nowrap shrink-0 text-[10.5px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-xs`}
                                  >
                                    <span className="text-[8px] leading-none">🟢</span>
                                    <span>New</span>
                                  </span>
                                ) : (
                                  <span 
                                    className={`${styles.statusBadge} whitespace-nowrap flex-nowrap shrink-0 text-[10.5px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs`}
                                  >
                                    <Eye size={14} className="stroke-[3]" />
                                    <span>Viewed</span>
                                  </span>
                                )}
                              </div>
                              <span className={styles.leadSubtext}>{lead.email}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.leadCell}>
                              <span className={styles.leadCompany}>{comp}</span>
                              <span className={styles.leadSubtext}>{lead.industry || 'No Industry'}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.leadAttributes}>
                              {size && size !== '-' && (
                                <span className={styles.pillAttribute}>{size} employees</span>
                              )}
                              {lead.phone && (
                                <span className={styles.pillAttribute}>{lead.phone}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={styles.leadDate}>
                              {new Date(lead.created_at).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-4 pr-3">
                              <button
                                type="button"
                                className="flex items-center justify-center p-1.5 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(lead);
                                }}
                                title="Delete Inquiry"
                              >
                                <Trash2 size={14} />
                              </button>
                              <ChevronRight size={16} className={`${styles.rowChevron} shrink-0`} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Panel: Lead Detail View */}
          <div className={styles.detailCard}>
            {selectedInquiry ? (
              <Card variant="outline" padding="lg" className={styles.leadDetailsPanel}>
                <div className={styles.detailHeader}>
                  <div className={styles.detailHeaderBadge}>
                    {selectedInquiry.full_name?.charAt(0) || selectedInquiry.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={styles.detailName}>
                        {selectedInquiry.full_name || selectedInquiry.fullName || 'Unknown Contact'}
                      </h4>
                      {(selectedInquiry.status || 'New') === 'New' ? (
                        <span 
                          className={`${styles.statusBadge} whitespace-nowrap flex-nowrap shrink-0 text-[10.5px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-xs`}
                        >
                          <span className="text-[8px] leading-none">🟢</span>
                          <span>New</span>
                        </span>
                      ) : (
                        <span 
                          className={`${styles.statusBadge} whitespace-nowrap flex-nowrap shrink-0 text-[10.5px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs`}
                        >
                          <Eye size={14} className="stroke-[3]" />
                          <span>Viewed</span>
                        </span>
                      )}
                    </div>
                    <p className={styles.detailEmail}>{selectedInquiry.email}</p>
                  </div>
                </div>

                <hr className={styles.panelDivider} />

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <Building size={16} className={styles.metaIcon} />
                    <div>
                      <span className={styles.metaLabel}>Company Name</span>
                      <span className={styles.metaValue}>
                        {selectedInquiry.company_name || selectedInquiry.companyName || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.metaItem}>
                    <Phone size={16} className={styles.metaIcon} />
                    <div>
                      <span className={styles.metaLabel}>Phone Number</span>
                      <span className={styles.metaValue}>{selectedInquiry.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className={styles.metaItem}>
                    <Briefcase size={16} className={styles.metaIcon} />
                    <div>
                      <span className={styles.metaLabel}>Industry</span>
                      <span className={styles.metaValue}>{selectedInquiry.industry || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className={styles.metaItem}>
                    <Users size={16} className={styles.metaIcon} />
                    <div>
                      <span className={styles.metaLabel}>Company Size</span>
                      <span className={styles.metaValue}>
                        {selectedInquiry.company_size || selectedInquiry.companySize || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.metaItem}>
                    <Calendar size={16} className={styles.metaIcon} />
                    <div>
                      <span className={styles.metaLabel}>Received Date</span>
                      <span className={styles.metaValue}>
                        {new Date(selectedInquiry.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.messageBox}>
                  <h5 className={styles.messageBoxTitle}>Customer Message / Requirement</h5>
                  <p className={styles.messageBoxText}>
                    {selectedInquiry.message || 'No additional message was submitted.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 dark:border-red-900/30 dark:hover:bg-red-950/20 cursor-pointer"
                    onClick={() => handleDeleteClick(selectedInquiry)}
                  >
                    <Trash2 size={14} className="mr-2" /> Delete Inquiry
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={styles.detailPlaceholder}>
                <Users size={36} className="mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium">Select a Lead Inquiry</p>
                <p className="text-xs text-slate-400">Click any row in the inquiries table to inspect lead details and core message.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal Overlay */}
      {inquiryToDelete && (
        <div 
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInquiryToDelete(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          <div className={styles.modalContent}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "flex-start",
                margin: 0,
                padding: 0
              }}
            >
              <Trash2
                size={20}
                className="text-red-600 dark:text-red-400"
                style={{
                  display: "block",
                  flexShrink: 0,
                  margin: 0,
                  padding: 0
                }}
              />
              <h3
                id="delete-modal-title"
                className="text-[20px] font-bold text-slate-900 dark:text-slate-100"
                style={{
                  margin: 0,
                  padding: 0,
                  lineHeight: 1
                }}
              >
                Confirm Deletion
              </h3>
            </div>
            <p id="delete-modal-description" className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete this inquiry?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                ref={cancelBtnRef}
                variant="outline"
                size="sm"
                onClick={() => setInquiryToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                onClick={handleConfirmDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
