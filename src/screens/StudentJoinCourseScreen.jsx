import React, { useState, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Layers,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const StudentJoinCourseScreen = () => {
  const { classes, joinCourse, currentUser, setActiveTab } = useApp();
  const [courseInput, setCourseInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [pendingCourse, setPendingCourse] = useState(null);
  const [joinedCourse, setJoinedCourse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef(null);

  // Available courses not yet joined
  const enrolledIds = currentUser?.enrolledClassIds || [];
  const availableCourses = classes.filter(c => !enrolledIds.includes(c.id));

  const handleLookupCourse = (codeToLookup) => {
    setErrorMessage('');
    const code = (codeToLookup || courseInput).trim().toUpperCase();
    if (!code) {
      setErrorMessage('Please enter a Course Code.');
      return;
    }

    const found = classes.find(c =>
      c.code.toUpperCase() === code ||
      c.id.toUpperCase() === code
    );

    if (!found) {
      setErrorMessage(`No course found with code "${code}". Please verify with your teacher.`);
      return;
    }

    if (enrolledIds.includes(found.id) || (found.enrolledStudentIds || []).includes(currentUser?.id)) {
      setErrorMessage(`You are already enrolled in ${found.code}: ${found.name}.`);
      return;
    }

    // Open confirmation before joining
    setPendingCourse(found);
  };

  const handleConfirmEnrollment = () => {
    if (!pendingCourse) return;
    const res = joinCourse(pendingCourse.code, currentUser?.id);
    if (res.success) {
      setJoinedCourse(res.course);
      setPendingCourse(null);
      setCourseInput('');
    } else {
      setErrorMessage(res.message);
    }
  };

  const toggleCamera = () => {
    if (!isCameraActive) {
      setIsCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
            }
          })
          .catch(() => {
            // Simulated camera viewfinder active
          });
      }
    } else {
      setIsCameraActive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Join a Course
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Scan your teacher's <strong>Course Joining QR Code</strong> or enter the Course Code to enroll in classes.
        </p>
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
            fontSize: '0.8125rem'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Dual Box: QR Camera Scanner + Manual Code Input */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Method 1: Camera Scanner for Course QR */}
        <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--brand-subtle)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <Camera size={22} />
          </div>

          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Scan Course QR Code
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Point your device camera at the teacher's projected or displayed Joining QR Code.
          </p>

          {/* Viewfinder */}
          <div
            style={{
              width: '100%',
              height: '190px',
              borderRadius: 'var(--radius-lg)',
              background: '#090d16',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  playsInline
                  muted
                />
                <div
                  style={{
                    position: 'absolute',
                    width: '130px',
                    height: '130px',
                    border: '2px solid rgba(37, 99, 235, 0.85)',
                    borderRadius: '12px',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    pointerEvents: 'none',
                    animation: 'pulse 1.8s infinite'
                  }}
                />
              </>
            ) : (
              <div style={{ color: '#94a3b8', padding: '1rem' }}>
                <QrCode size={34} style={{ marginBottom: '0.4rem', opacity: 0.6 }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  Camera Ready
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  Tap below to launch optical scanner
                </div>
              </div>
            )}
          </div>

          <Button
            variant={isCameraActive ? 'danger' : 'secondary'}
            size="md"
            icon={Camera}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={toggleCamera}
          >
            {isCameraActive ? 'Close Scanner' : 'Open Camera Scanner'}
          </Button>
        </div>

        {/* Method 2: Manual Course Code Input */}
        <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--emerald-50)',
                color: 'var(--emerald-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <BookOpen size={22} />
            </div>

            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Enter Course Code Manually
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              If you don't have camera access, type the Course Code provided by your teacher.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookupCourse();
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="sa-label">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CS-301 or CRS-101"
                  className="sa-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', textTransform: 'uppercase' }}
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!courseInput.trim()}
              >
                <span>Find & Join Course</span>
                <ArrowRight size={16} />
              </Button>
            </form>
          </div>

          {/* Quick Available Directory preview */}
          {availableCourses.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Available Institutional Courses ({availableCourses.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '110px', overflowY: 'auto' }}>
                {availableCourses.slice(0, 3).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleLookupCourse(c.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      textAlign: 'left'
                    }}
                  >
                    <span><strong>{c.code}</strong>: {c.name}</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Enroll →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION BEFORE JOINING MODAL */}
      <Modal
        isOpen={!!pendingCourse}
        onClose={() => setPendingCourse(null)}
        title="Confirm Course Enrollment"
        subtitle="Verify course details before joining into this classroom curriculum."
      >
        {pendingCourse && (
          <div>
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    padding: '0.2rem 0.6rem',
                    background: 'var(--brand-subtle)',
                    color: 'var(--brand-primary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {pendingCourse.code}
                </span>
                <Badge variant="brand">{pendingCourse.department}</Badge>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {pendingCourse.name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Faculty Instructor: <strong>{pendingCourse.teacher}</strong>
              </p>

              {pendingCourse.description && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {pendingCourse.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setPendingCourse(null)}>
                Cancel
              </Button>
              <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmEnrollment}>
                Confirm & Join Course
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ENROLLMENT CELEBRATION MODAL */}
      <Modal
        isOpen={!!joinedCourse}
        onClose={() => setJoinedCourse(null)}
        title="Enrolled Successfully!"
        subtitle="You are now registered in this course and can participate in attendance sessions."
      >
        {joinedCourse && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--emerald-50)',
                color: 'var(--emerald-600)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Welcome to {joinedCourse.code}!
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {joinedCourse.name} with {joinedCourse.teacher} has been added to your enrolled courses dashboard.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Button
                variant="primary"
                onClick={() => {
                  setJoinedCourse(null);
                  setActiveTab('dashboard');
                }}
              >
                Go to Student Dashboard →
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
