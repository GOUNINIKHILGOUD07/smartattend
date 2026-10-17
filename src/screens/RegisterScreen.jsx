import React, { useState } from 'react';
import {
  QrCode,
  UserCheck,
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  User,
  Hash,
  BookOpen,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';

export const RegisterScreen = () => {
  const { register, setAuthView, classes } = useApp();

  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student specific fields
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState('1st Semester');
  const [selectedClassIds, setSelectedClassIds] = useState([]);

  // Teacher specific fields
  const [teacherId, setTeacherId] = useState('');
  const [department, setDepartment] = useState('Computer Science');

  const [errorMessage, setErrorMessage] = useState('');

  const handleClassToggle = (classId) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      confirmPassword,
      role,
      studentId: role === 'student' ? studentId : undefined,
      semester: role === 'student' ? semester : undefined,
      teacherId: role === 'teacher' ? teacherId : undefined,
      department: role === 'teacher' ? department : undefined,
      classIds: selectedClassIds
    };

    const res = register(payload);
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
        padding: '2rem 1.5rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
              marginBottom: '0.75rem'
            }}
          >
            <QrCode size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Smart<span style={{ color: 'var(--brand-primary)' }}>Attend</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Create your account to start managing attendance
          </p>
        </div>

        {/* Register Card */}
        <div className="sa-card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
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

          <form onSubmit={handleSubmit}>
            {/* Role Selector Tabs */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="sa-label">Account Type *</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.35rem',
                  background: 'var(--bg-subtle)',
                  padding: '4px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 0',
                    fontSize: '0.75rem',
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
                  <GraduationCap size={15} />
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 0',
                    fontSize: '0.75rem',
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
                  <UserCheck size={15} />
                  Teacher
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background: role === 'admin' ? '#ffffff' : 'transparent',
                    color: role === 'admin' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    boxShadow: role === 'admin' ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Building size={15} />
                  Admin
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="sa-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={role === 'student' ? 'e.g. Rahul Sharma' : role === 'teacher' ? 'e.g. Prof. David Miller' : 'e.g. Dr. Arthur King'}
                  className="sa-input"
                  style={{ paddingLeft: '2.35rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="sa-label">Institutional Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="name@campus.edu"
                  className="sa-input"
                  style={{ paddingLeft: '2.35rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {role === 'student' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="sa-label">Student Roll Number / ID *</label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="e.g. 24CS0142"
                        className="sa-input"
                        style={{ paddingLeft: '2.35rem', fontFamily: 'var(--font-mono)' }}
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="sa-label">Semester</label>
                    <select
                      className="sa-select"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    >
                      <option value="1st Semester">1st Sem</option>
                      <option value="2nd Semester">2nd Sem</option>
                      <option value="3rd Semester">3rd Sem</option>
                      <option value="4th Semester">4th Sem</option>
                      <option value="5th Semester">5th Sem</option>
                      <option value="6th Semester">6th Sem</option>
                      <option value="7th Semester">7th Sem</option>
                      <option value="8th Semester">8th Sem</option>
                    </select>
                  </div>
                </div>

                {/* Enrolled Classes Selection */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="sa-label">Enroll in Courses</label>
                  {classes.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        background: 'var(--bg-subtle)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }}
                    >
                      {classes.map((cls) => {
                        const isSelected = selectedClassIds.includes(cls.id);
                        return (
                          <label
                            key={cls.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.8125rem',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleClassToggle(cls.id)}
                            />
                            <span><strong>{cls.code}</strong>: {cls.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                      No courses created yet. Faculty/Admin will add courses to the system.
                    </div>
                  )}
                </div>
              </>
            )}

            {role === 'teacher' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="sa-label">Faculty / Teacher ID *</label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="e.g. TCH-001"
                        className="sa-input"
                        style={{ paddingLeft: '2.35rem', fontFamily: 'var(--font-mono)' }}
                        value={teacherId}
                        onChange={(e) => setTeacherId(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="sa-label">Department</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select
                        className="sa-select"
                        style={{ paddingLeft: '2.35rem' }}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Artificial Intelligence">AI & Data Science</option>
                        <option value="Software Engineering">Software Eng</option>
                        <option value="Electrical Engineering">Electrical Eng</option>
                        <option value="Mechanical Engineering">Mechanical Eng</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="sa-label">Assigned Classes to Teach</label>
                  {classes.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        background: 'var(--bg-subtle)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      {classes.map((cls) => {
                        const isSelected = selectedClassIds.includes(cls.id);
                        return (
                          <label
                            key={cls.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.8125rem',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleClassToggle(cls.id)}
                            />
                            <span><strong>{cls.code}</strong>: {cls.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                      No classes created yet. You can create classes after registering.
                    </div>
                  )}
                </div>
              </>
            )}

            {role === 'admin' && (
              <div style={{ marginBottom: '1rem', background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Institutional Administrator:</strong> Full control over curriculum, student rosters, faculty appointments, and master attendance audits.
              </div>
            )}

            {/* Password Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="sa-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    className="sa-input"
                    style={{ paddingLeft: '2.2rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="sa-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className="sa-input"
                    style={{ paddingLeft: '2.2rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Complete Registration</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Switch to Login Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setAuthView('login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.8125rem'
                }}
              >
                Sign In to Account →
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
