import React, { useState, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const StudentScanAttendanceScreen = () => {
  const {
    currentUser,
    classes,
    activeSession,
    attendanceRecords,
    markAttendance,
    setActiveTab
  } = useApp();

  const [manualToken, setManualToken] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef(null);

  const studentId = currentUser?.id;
  const rollNo = currentUser?.studentId || currentUser?.rollNo || studentId;

  // Check enrollment in active session's course
  const enrolledClassIds = currentUser?.enrolledClassIds || [];
  const activeCourse = activeSession ? classes.find(c => c.id === activeSession.classId) : null;
  const isEnrolledInActiveSession = activeCourse && (
    enrolledClassIds.includes(activeCourse.id) ||
    (activeCourse.enrolledStudentIds || []).includes(studentId) ||
    (activeCourse.enrolledStudentIds || []).includes(rollNo)
  );

  const isAlreadyCheckedIn = activeSession && attendanceRecords.some(
    r => (r.studentId === studentId || r.rollNo === rollNo) &&
         r.classId === activeSession.classId &&
         r.date === activeSession.date &&
         r.status === 'Present'
  );

  const handleScanSubmit = (tokenToSubmit) => {
    setErrorMessage('');
    const token = (tokenToSubmit || manualToken).trim();
    if (!token) {
      setErrorMessage('Please enter an attendance session token.');
      return;
    }

    const res = markAttendance(token, studentId, 'QR Scan Verification');
    if (res.success) {
      setVerifiedRecord(res.record);
      setManualToken('');
    } else {
      setErrorMessage(res.message || 'Verification failed. Please check the code.');
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
          .catch(() => {});
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
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Scan Attendance QR
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Mark presence for live classroom attendance sessions using your device camera or session token.
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

      {/* Active Session Status Callout */}
      {activeSession ? (
        <div
          className="sa-card"
          style={{
            padding: '1.5rem',
            background: !isEnrolledInActiveSession
              ? 'var(--amber-50)'
              : isAlreadyCheckedIn
              ? 'var(--emerald-50)'
              : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: !isEnrolledInActiveSession
              ? '1px solid var(--amber-200)'
              : isAlreadyCheckedIn
              ? '1px solid var(--emerald-200)'
              : '1px solid #bfdbfe'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: !isEnrolledInActiveSession
                    ? 'var(--amber-600)'
                    : isAlreadyCheckedIn
                    ? 'var(--emerald-600)'
                    : 'var(--brand-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                {!isEnrolledInActiveSession ? (
                  <AlertTriangle size={24} />
                ) : isAlreadyCheckedIn ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <QrCode size={24} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activeSession.classCode}: {activeSession.className}
                  </h3>
                  <Badge variant={!isEnrolledInActiveSession ? 'warning' : isAlreadyCheckedIn ? 'present' : 'brand'}>
                    {!isEnrolledInActiveSession ? 'Not Enrolled' : isAlreadyCheckedIn ? 'Present' : 'Live Check-in Open'}
                  </Badge>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Topic: "{activeSession.topic}" • Instructor: {activeSession.teacherName}
                </p>
              </div>
            </div>

            {!isEnrolledInActiveSession ? (
              <Button
                variant="primary"
                size="md"
                icon={BookOpen}
                onClick={() => setActiveTab('join-course')}
              >
                Join Course to Mark Attendance →
              </Button>
            ) : isAlreadyCheckedIn ? (
              <Badge variant="present" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}>
                ✓ Attendance Verified
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                onClick={() => handleScanSubmit(activeSession.token)}
              >
                Instant Check-in Now
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="sa-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No Active Attendance Session Right Now
          </h3>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            When your teacher begins a session for your enrolled class, live attendance check-in will open here.
          </p>
        </div>
      )}

      {/* Camera Scanner & Manual Token Input */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Camera Viewfinder */}
        <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Camera QR Scanner
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Point camera at the teacher's projected session QR code.
          </p>

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
                <Camera size={34} style={{ marginBottom: '0.4rem', opacity: 0.6 }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  Camera Standby
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  Click below to open camera scanner
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

        {/* Manual Token Entry */}
        <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Manual Session Code Entry
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Enter the session token displayed by your teacher.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanSubmit();
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="sa-label">Session Token</label>
                <input
                  type="text"
                  placeholder={activeSession ? `e.g. ${activeSession.token}` : 'e.g. SA-K8D2'}
                  className="sa-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', textTransform: 'uppercase' }}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!manualToken.trim()}
              >
                <span>Submit Attendance</span>
                <ArrowRight size={16} />
              </Button>
            </form>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <strong>Note:</strong> You must be registered and enrolled in this course to mark attendance. Check-ins are timestamped and cryptographically signed.
          </div>
        </div>
      </div>

      {/* VERIFIED SUCCESS MODAL */}
      <Modal
        isOpen={!!verifiedRecord}
        onClose={() => setVerifiedRecord(null)}
        title="Attendance Successfully Recorded!"
        subtitle="Your presence has been verified and registered in the course roster."
      >
        {verifiedRecord && (
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
              Marked Present!
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Course: <strong>{verifiedRecord.className}</strong> • Time: <strong>{verifiedRecord.time}</strong> • Date: <strong>{verifiedRecord.date}</strong>
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Button
                variant="primary"
                onClick={() => {
                  setVerifiedRecord(null);
                  setActiveTab('dashboard');
                }}
              >
                Return to Dashboard →
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
