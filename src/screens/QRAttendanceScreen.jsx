import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Camera,
  Play,
  StopCircle,
  Download,
  Maximize2,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  AlertCircle,
  Upload,
  KeyRound,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const QRAttendanceScreen = () => {
  const {
    currentUser,
    classes,
    students,
    activeSession,
    startQRSession,
    stopQRSession,
    markAttendance
  } = useApp();

  // If teacher, show only their assigned classes; if admin, show all
  const availableClasses = currentUser?.role === 'teacher'
    ? classes.filter(c =>
        c.teacherId === currentUser.teacherId ||
        c.teacher === currentUser.name ||
        (currentUser.assignedClassIds || []).includes(c.id)
      )
    : classes;

  const [selectedClassId, setSelectedClassId] = useState(availableClasses[0]?.id || classes[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(15);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // Time remaining state
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, percent: 100 });
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState(null);

  // Video ref for camera
  const videoRef = useRef(null);

  // Render QR Code data URL when session is active
  useEffect(() => {
    if (activeSession) {
      const payload = JSON.stringify({
        app: 'SmartAttend',
        token: activeSession.token,
        classId: activeSession.classId,
        classCode: activeSession.classCode,
        sessionDate: activeSession.date
      });

      QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    } else {
      setQrDataUrl('');
    }
  }, [activeSession]);

  // Live Countdown timer
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(activeSession.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, percent: 0 });
        clearInterval(interval);
      } else {
        const totalMs = activeSession.durationMinutes * 60 * 1000;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const percent = Math.max(0, Math.min(100, (diff / totalMs) * 100));
        setTimeLeft({ minutes, seconds, percent });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStart = () => {
    startQRSession(selectedClassId, topic || 'Interactive Lecture Session', duration);
  };

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!manualToken) return;
    const targetStudentId = currentUser?.role === 'student' ? currentUser.id : undefined;
    const res = markAttendance(manualToken.trim(), targetStudentId, 'Manual Token');
    if (res.success) {
      setVerifiedRecord(res.record);
      setManualToken('');
    }
  };

  const handleQuickVerify = () => {
    if (!activeSession) return;
    const targetStudentId = currentUser?.role === 'student' ? currentUser.id : undefined;
    const res = markAttendance(activeSession.token, targetStudentId, 'QR Scan Verification');
    if (res.success) {
      setVerifiedRecord(res.record);
    }
  };

  // Camera toggle with fallback
  const toggleCamera = () => {
    if (!isScanningActive) {
      setIsScanningActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
            }
          })
          .catch(() => {
            // Permission not granted or localhost constraint: simulated viewfinder active
          });
      }
    } else {
      setIsScanningActive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `SmartAttend_QR_${activeSession?.classCode || 'Session'}.png`;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            QR Code Attendance Session
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {currentUser?.role === 'student'
              ? 'Scan or enter your teacher\'s session token to submit attendance for your account.'
              : 'Generate cryptographic session QR tokens, track real-time attendance, and monitor scans.'}
          </p>
        </div>

        {activeSession && (currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="md"
              icon={Maximize2}
              onClick={() => setIsProjectorMode(true)}
            >
              Projector Mode
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={Download}
              onClick={downloadQR}
            >
              Save QR Image
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={StopCircle}
              onClick={stopQRSession}
            >
              End Session
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid: Teacher QR Display & Student Scanner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Left Column: QR Code Display / Session Launcher */}
        <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {activeSession ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--brand-subtle)',
                    color: 'var(--brand-primary)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {activeSession.classCode}
                </span>
                <Badge variant="present">Session Live</Badge>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {activeSession.className}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Topic: "{activeSession.topic}" • Instructor: {activeSession.teacherName}
              </p>

              {/* QR Code Canvas Box */}
              <div
                style={{
                  padding: '1.25rem',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '1.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Attendance QR Code"
                    style={{ width: '240px', height: '240px', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw className="spin" size={32} color="var(--brand-primary)" />
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.85rem 1.25rem',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} /> Time Remaining
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 700, color: timeLeft.minutes < 2 ? 'var(--rose-600)' : 'var(--text-primary)' }}>
                    {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>

                <div className="sa-progress-bar">
                  <div
                    className="sa-progress-fill"
                    style={{
                      width: `${timeLeft.percent}%`,
                      background: timeLeft.minutes < 2 ? 'var(--rose-600)' : 'var(--brand-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Session Token Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Token for manual entry:</span>
                <code
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    background: '#f1f5f9',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {activeSession.token}
                </code>
              </div>
            </div>
          ) : (
            /* Launcher Form if no active session */
            <div style={{ width: '100%', maxWidth: '380px', padding: '1rem 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'var(--brand-subtle)',
                  color: 'var(--brand-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <QrCode size={30} />
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {currentUser?.role === 'student' ? 'No Active Session' : 'Broadcast QR Attendance'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {currentUser?.role === 'student'
                  ? 'Awaiting faculty instructor to start an attendance session.'
                  : 'Select your class, lecture topic, and duration to generate the code.'}
              </p>

              {currentUser?.role !== 'student' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                  <div>
                    <label className="sa-label">Select Course</label>
                    <select
                      className="sa-select"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                      {availableClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code}: {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="sa-label">Lecture Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Consensus Algorithms"
                      className="sa-input"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="sa-label">Timer Duration</label>
                    <select
                      className="sa-select"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    >
                      <option value={5}>5 Minutes</option>
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                    </select>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    icon={Play}
                    disabled={availableClasses.length === 0}
                    onClick={handleStart}
                    style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                  >
                    Generate Dynamic QR Code
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Attendance Verification Station */}
        <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Student Check-in Station
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {currentUser?.role === 'student'
                    ? `Checking in as: ${currentUser.name} (${currentUser.studentId || currentUser.rollNo})`
                    : 'Simulate or test student check-in submissions.'}
                </p>
              </div>
              <Badge variant="brand">Ready</Badge>
            </div>

            {/* Current Account Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem'
              }}
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {currentUser?.role === 'student' ? `ID: ${currentUser.studentId || currentUser.rollNo}` : `${currentUser?.title || currentUser?.role}`}
                </div>
              </div>
            </div>

            {/* Camera Viewfinder */}
            <div
              style={{
                width: '100%',
                height: '200px',
                borderRadius: 'var(--radius-lg)',
                background: '#090d16',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {isScanningActive ? (
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
                      width: '140px',
                      height: '140px',
                      border: '2px solid rgba(37, 99, 235, 0.8)',
                      borderRadius: '12px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                      pointerEvents: 'none',
                      animation: 'pulse 1.8s infinite'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#ffffff',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  >
                    Point camera at attendance QR
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                  <Camera size={34} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                    Camera Standby
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    Click below to open camera or perform 1-click verification
                  </div>
                </div>
              )}
            </div>

            {/* Check-in Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Button
                variant={isScanningActive ? 'danger' : 'secondary'}
                size="md"
                icon={Camera}
                onClick={toggleCamera}
              >
                {isScanningActive ? 'Close Camera' : 'Open Camera'}
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                disabled={!activeSession}
                onClick={handleQuickVerify}
              >
                ⚡ Verify Presence
              </Button>
            </div>

            {/* Manual Token Entry Fallback */}
            <form onSubmit={handleManualCheckIn} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <label className="sa-label">Or Submit Token Manually</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder={activeSession ? `e.g. ${activeSession.token}` : 'e.g. SA-X9K2'}
                  className="sa-input"
                  style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                />
                <Button type="submit" variant="secondary" disabled={!activeSession || !manualToken}>
                  Submit
                </Button>
              </div>
            </form>
          </div>

          {/* Live Verified Roster for Active Session */}
          {activeSession && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Verified Students ({activeSession.checkedInStudents?.length || 0})
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
                  ● Live Updating
                </span>
              </div>

              {activeSession.checkedInStudents?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '90px', overflowY: 'auto' }}>
                  {activeSession.checkedInStudents.map((st, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--emerald-50)',
                        color: 'var(--emerald-700)',
                        border: '1px solid var(--emerald-200)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      ✓ {st.name} <span style={{ opacity: 0.7, fontSize: '0.6875rem' }}>({st.time})</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Awaiting student submissions for this session.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Verified Success Modal */}
      <Modal
        isOpen={!!verifiedRecord}
        onClose={() => setVerifiedRecord(null)}
        title="Attendance Successfully Verified!"
        subtitle="Your presence has been recorded into the institutional ledger."
      >
        {verifiedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--emerald-50)',
                color: 'var(--emerald-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--emerald-200)'
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {verifiedRecord.studentName}
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Student Roll No: {verifiedRecord.rollNo}
            </span>

            <div
              style={{
                width: '100%',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Course:</span>
                <strong>{verifiedRecord.className}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                <span>{verifiedRecord.date} at {verifiedRecord.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Verification Status:</span>
                <Badge variant="present">Verified Present</Badge>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setVerifiedRecord(null)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done & Return
            </Button>
          </div>
        )}
      </Modal>

      {/* Projector Fullscreen Modal */}
      <Modal
        isOpen={isProjectorMode}
        onClose={() => setIsProjectorMode(false)}
        title="Classroom Wall Projector Mode"
        maxWidth="640px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.25rem' }}>
            {activeSession?.classCode}: {activeSession?.className}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Scan to Record Attendance
          </h2>

          <div
            style={{
              padding: '1.5rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid var(--brand-primary)',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '1.25rem'
            }}
          >
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Projector QR"
                style={{ width: '300px', height: '300px', display: 'block' }}
              />
            )}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Session Code: {activeSession?.token}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Press Esc or click outside to close projector view
          </p>
        </div>
      </Modal>
    </div>
  );
};
