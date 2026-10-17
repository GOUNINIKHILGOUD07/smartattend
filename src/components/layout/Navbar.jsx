import React from 'react';
import {
  Menu,
  Bell,
  Search,
  Sparkles,
  QrCode,
  CheckCircle2,
  ChevronDown,
  Shield,
  GraduationCap,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const Navbar = ({ onMobileMenuToggle }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    activeSession,
    logout
  } = useApp();

  const tabTitles = {
    dashboard: 'Dashboard Overview',
    'my-courses': 'My Courses & Curriculum',
    'create-course': 'Create New Course',
    'qr-codes': 'QR Codes Management Hub',
    attendance: 'Attendance Management & Records',
    classes: 'Academic Curriculum & Courses',
    students: 'Enrolled Students Directory',
    'qr-attendance': 'Live QR Attendance Session',
    'attendance-history': 'Attendance History & Audit Logs',
    'join-course': 'Join Course with QR Code',
    'scan-attendance': 'Scan Attendance QR Code',
    reports: 'Attendance Analytics & Reporting'
  };

  return (
    <header
      style={{
        height: '64px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        gap: '1rem'
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMobileMenuToggle}
          className="sa-mobile-only"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {tabTitles[activeTab] || 'Overview'}
          </h2>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            SmartAttend Educational Portal
          </span>
        </div>
      </div>

      {/* Right: Quick Role Switcher, Session Alert, Profile & Sign Out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Active Session Indicator */}
        {activeSession && (
          <button
            onClick={() => setActiveTab('qr-attendance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--rose-50)',
              border: '1px solid var(--rose-200)',
              color: 'var(--rose-700)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--rose-600)',
                animation: 'pulse 1.5s infinite'
              }}
            />
            <span>Live: {activeSession.classCode}</span>
          </button>
        )}

        {/* Current User Badge & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
            alt={currentUser?.name}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-full)',
              objectFit: 'cover',
              border: '2px solid var(--border-subtle)'
            }}
          />
          <div className="sa-desktop-only">
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser?.name}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {currentUser?.role}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem',
              cursor: 'pointer',
              color: 'var(--rose-600)',
              marginLeft: '0.25rem'
            }}
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
