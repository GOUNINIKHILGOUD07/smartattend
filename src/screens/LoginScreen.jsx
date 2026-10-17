import React, { useState } from 'react';
import {
  QrCode,
  ArrowRight,
  Lock,
  User,
  Hash,
  AlertCircle,
  UserPlus,
  Info,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';

export const LoginScreen = () => {
  const { login, setAuthView, accounts } = useApp();
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login({ name, rollNo, password, role });
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, #eff6ff 0%, #f8fafc 70%)',
        padding: '1.5rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)',
              marginBottom: '1rem'
            }}
          >
            <QrCode size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Smart<span style={{ color: 'var(--brand-primary)' }}>Attend</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Institutional QR Attendance & Class Management
          </p>
        </div>

        {/* Login Card */}
        <div className="sa-card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Role Selection Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              background: 'var(--bg-subtle)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMessage('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: role === 'student' ? '#ffffff' : 'transparent',
                color: role === 'student' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: role === 'student' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <GraduationCap size={16} />
              Student Login
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setErrorMessage('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: role === 'teacher' ? '#ffffff' : 'transparent',
                color: role === 'teacher' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: role === 'teacher' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <UserCheck size={16} />
              Teacher Login
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--rose-50)',
                border: '1px solid var(--rose-200)',
                color: 'var(--rose-700)',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Prompt if database has 0 accounts */}
          {accounts.length === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-subtle)',
                border: '1px solid #bfdbfe',
                color: 'var(--brand-primary)',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem'
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>No accounts registered yet. Please click Register New Account below.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="sa-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                >
                  <User size={16} />
                </div>
                <input
                  type="text"
                  className="sa-input"
                  style={{ paddingLeft: '2.35rem' }}
                  placeholder={role === 'student' ? 'e.g. John Doe' : 'e.g. Prof. David Miller'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Roll Number / Teacher ID / Email Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="sa-label">
                {role === 'student' ? 'Roll Number / Student ID / Email' : 'Teacher ID / Faculty Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                >
                  <Hash size={16} />
                </div>
                <input
                  type="text"
                  className="sa-input"
                  style={{ paddingLeft: '2.35rem', fontFamily: 'var(--font-mono)' }}
                  placeholder={role === 'student' ? 'e.g. 24CS0142 or student@campus.edu' : 'e.g. TCH-001 or faculty@campus.edu'}
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="sa-label" style={{ margin: 0 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                >
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  className="sa-input"
                  style={{ paddingLeft: '2.35rem' }}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>{role === 'student' ? 'Sign In as Student' : 'Sign In as Teacher'}</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Switch to Register Button */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              New to SmartAttend?{' '}
            </span>
            <button
              type="button"
              onClick={() => setAuthView('register')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <UserPlus size={14} />
              Register New Account →
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          SmartAttend • Institutional QR Code Attendance Platform
        </p>
      </div>
    </div>
  );
};
