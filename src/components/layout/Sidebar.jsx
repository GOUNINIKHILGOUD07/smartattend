import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  QrCode,
  History,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const Sidebar = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    activeSession,
    logout
  } = useApp();

  let navItems = [];

  if (currentUser?.role === 'teacher') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'my-courses', label: 'My Courses', icon: BookOpen },
      { id: 'create-course', label: 'Create Course', icon: BookOpen },
      {
        id: 'qr-codes',
        label: 'QR Codes',
        icon: QrCode,
        badge: activeSession ? 'LIVE' : null
      },
      { id: 'attendance', label: 'Attendance', icon: History },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'reports', label: 'Reports', icon: BarChart3 }
    ];
  } else if (currentUser?.role === 'student') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'my-courses', label: 'My Courses', icon: BookOpen },
      { id: 'join-course', label: 'Join Course', icon: Users },
      {
        id: 'scan-attendance',
        label: 'Scan Attendance',
        icon: QrCode,
        badge: activeSession ? 'ACTIVE' : null
      },
      { id: 'attendance-history', label: 'Attendance History', icon: History }
    ];
  } else {
    // Admin or fallback
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'classes', label: 'Courses & Classes', icon: BookOpen },
      { id: 'students', label: 'Students & Faculty', icon: Users },
      {
        id: 'qr-attendance',
        label: 'QR Codes Hub',
        icon: QrCode,
        badge: activeSession ? 'LIVE' : null
      },
      { id: 'attendance-history', label: 'Attendance Logs', icon: History },
      { id: 'reports', label: 'Reports & CSV', icon: BarChart3 }
    ];
  }

  return (
    <aside
      style={{
        width: sidebarCollapsed ? '72px' : '240px',
        minWidth: sidebarCollapsed ? '72px' : '240px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 30
      }}
    >
      {/* Top Brand Header */}
      <div>
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            padding: sidebarCollapsed ? '0' : '0 1.25rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                flexShrink: 0
              }}
            >
              <QrCode size={18} />
            </div>
            {!sidebarCollapsed && (
              <span style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Smart<span style={{ color: 'var(--brand-primary)' }}>Attend</span>
              </span>
            )}
          </div>

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: 'var(--radius-xs)'
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {sidebarCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px'
              }}
              title="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ padding: '0.75rem 0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    width: '100%',
                    padding: sidebarCollapsed ? '0.6rem 0' : '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--brand-subtle)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    textAlign: 'left'
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={18} color={isActive ? 'var(--brand-primary)' : 'var(--text-secondary)'} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--rose-600)',
                        color: '#ffffff',
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer Profile & Actions */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '0.75rem 0.5rem' }}>
        {!sidebarCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.5rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)'
              }}
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={currentUser?.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover'
                }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {currentUser?.role} Account
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--rose-600)',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
              alt={currentUser?.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                objectFit: 'cover'
              }}
              title={currentUser?.name}
            />
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--rose-600)',
                padding: '4px'
              }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
