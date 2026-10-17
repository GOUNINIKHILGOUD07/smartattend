import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Play,
  StopCircle,
  Download,
  Maximize2,
  Users,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Copy,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const QRCodesHubScreen = () => {
  const {
    currentUser,
    classes,
    activeSession,
    startQRSession,
    stopQRSession,
    showToast
  } = useApp();

  // Filter teacher's courses
  const teacherId = currentUser?.teacherId || currentUser?.id;
  const teacherCourses = currentUser?.role === 'teacher'
    ? classes.filter(c => c.teacherId === teacherId || c.teacher === currentUser?.name || (currentUser.assignedClassIds || []).includes(c.id))
    : classes;

  const [activeTabMode, setActiveTabMode] = useState(activeSession ? 'attendance-qr' : 'joining-qr');
  const [selectedCourseId, setSelectedCourseId] = useState(teacherCourses[0]?.id || classes[0]?.id || '');
  const [topic, setTopic] = useState('Lecture Session');
  const [duration, setDuration] = useState(15);

  // QR URLs
  const [joiningQRUrl, setJoiningQRUrl] = useState('');
  const [attendanceQRUrl, setAttendanceQRUrl] = useState('');
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);

  // Time remaining for active session
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, percent: 100 });

  const selectedCourse = teacherCourses.find(c => c.id === selectedCourseId) || teacherCourses[0] || classes[0];

  // Generate Course Joining QR URL
  useEffect(() => {
    if (selectedCourse) {
      const payload = JSON.stringify({
        type: 'COURSE_JOIN',
        app: 'SmartAttend',
        courseId: selectedCourse.id,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        teacher: selectedCourse.teacher
      });

      QRCode.toDataURL(payload, {
        width: 340,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then(url => setJoiningQRUrl(url))
        .catch(err => console.error(err));
    }
  }, [selectedCourseId, selectedCourse]);

  // Generate Attendance Session QR URL
  useEffect(() => {
    if (activeSession) {
      const payload = JSON.stringify({
        type: 'ATTENDANCE_SESSION',
        app: 'SmartAttend',
        token: activeSession.token,
        classId: activeSession.classId,
        courseCode: activeSession.classCode,
        sessionDate: activeSession.date
      });

      QRCode.toDataURL(payload, {
        width: 340,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then(url => setAttendanceQRUrl(url))
        .catch(err => console.error(err));
    } else {
      setAttendanceQRUrl('');
    }
  }, [activeSession]);

  // Countdown timer for active session
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

  const handleStartAttendance = () => {
    if (!selectedCourse) return;
    startQRSession(selectedCourse.id, topic || 'Lecture Session', duration);
    setActiveTabMode('attendance-qr');
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast('Copied', `${label} copied to clipboard!`);
  };

  const downloadQR = (url, filename) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            QR Code Operations
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Broadcast <strong>Course Joining QR Codes</strong> for enrollment or generate dynamic <strong>Session Attendance QR Codes</strong>.
          </p>
        </div>

        {/* Tab mode toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            onClick={() => setActiveTabMode('joining-qr')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: activeTabMode === 'joining-qr' ? '#ffffff' : 'transparent',
              color: activeTabMode === 'joining-qr' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              boxShadow: activeTabMode === 'joining-qr' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <BookOpen size={15} />
            Course Joining QR
          </button>

          <button
            onClick={() => setActiveTabMode('attendance-qr')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: activeTabMode === 'attendance-qr' ? '#ffffff' : 'transparent',
              color: activeTabMode === 'attendance-qr' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              boxShadow: activeTabMode === 'attendance-qr' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <QrCode size={15} />
            Attendance QR
            {activeSession && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--rose-600)',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            )}
          </button>
        </div>
      </div>

      {teacherCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses created yet"
          message="Create a course before generating joining QR codes or live attendance sessions."
        />
      ) : (
        /* TAB 1: COURSE JOINING QR CODES */
        activeTabMode === 'joining-qr' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Left: QR Display Card */}
            <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Badge variant="brand" style={{ marginBottom: '1rem' }}>
                Course Joining QR • Permanent
              </Badge>

              <div
                style={{
                  padding: '1.25rem',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '1.25rem'
                }}
              >
                {joiningQRUrl ? (
                  <img
                    src={joiningQRUrl}
                    alt={`Join QR for ${selectedCourse?.code}`}
                    style={{ width: '230px', height: '230px', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '230px', height: '230px' }} />
                )}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {selectedCourse?.name}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Course Code: <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedCourse?.code}</strong> • Enrolled: {(selectedCourse?.enrolledStudentIds || []).length} Students
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '340px' }}>
                <Button
                  variant="secondary"
                  size="md"
                  icon={Download}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => downloadQR(joiningQRUrl, `Join_${selectedCourse?.code}.png`)}
                >
                  Save Image
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  icon={Maximize2}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setIsProjectorOpen(true)}
                >
                  Projector Mode
                </Button>
              </div>
            </div>

            {/* Right: Select Course & Instructions */}
            <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Select Course to Broadcast
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Students scan this QR code with their mobile camera to enroll into your classroom curriculum.
                </p>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="sa-label">Select Your Course</label>
                  <select
                    className="sa-select"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {teacherCourses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.name} ({(c.enrolledStudentIds || []).length} enrolled)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manual Joining Code Card */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Course Code for Manual Entry
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      {selectedCourse?.code}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Copy}
                      onClick={() => handleCopy(selectedCourse?.code, 'Course Code')}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>How it works:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '0.35rem' }}>
                    <li>Display this QR code in class or share the course code.</li>
                    <li>Student logs in and taps <strong>"Join Course"</strong>.</li>
                    <li>Student scans code and confirms enrollment.</li>
                    <li>Course appears immediately in student's dashboard.</li>
                  </ol>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1.25rem' }}>
                <Button
                  variant="primary"
                  size="md"
                  icon={Play}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleStartAttendance}
                >
                  Launch Attendance Session for this Course →
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: LIVE ATTENDANCE QR CODES */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Attendance QR Display / Session Active Box */}
            <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {activeSession ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--brand-subtle)',
                        color: 'var(--brand-primary)'
                      }}
                    >
                      {activeSession.classCode}
                    </span>
                    <Badge variant="present">Session Active</Badge>
                  </div>

                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {activeSession.className}
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Topic: "{activeSession.topic}" • Started at {activeSession.startedAt}
                  </p>

                  <div
                    style={{
                      padding: '1.25rem',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-md)',
                      marginBottom: '1.25rem'
                    }}
                  >
                    {attendanceQRUrl && (
                      <img
                        src={attendanceQRUrl}
                        alt="Attendance QR"
                        style={{ width: '230px', height: '230px', display: 'block' }}
                      />
                    )}
                  </div>

                  {/* Countdown Timer */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
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

                  {/* Session Manual Token */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session Token:</span>
                    <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, background: 'var(--bg-subtle)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      {activeSession.token}
                    </code>
                    <button
                      onClick={() => handleCopy(activeSession.token, 'Session Token')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', padding: '2px' }}
                      title="Copy Token"
                    >
                      <Copy size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '320px' }}>
                    <Button
                      variant="danger"
                      size="md"
                      icon={StopCircle}
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={stopQRSession}
                    >
                      End Session
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      icon={Maximize2}
                      onClick={() => setIsProjectorOpen(true)}
                    >
                      Projector
                    </Button>
                  </div>
                </div>
              ) : (
                /* Session Launcher Config Form */
                <div style={{ width: '100%', maxWidth: '360px', padding: '1rem 0' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'var(--brand-subtle)',
                      color: 'var(--brand-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <QrCode size={26} />
                  </div>

                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Launch Live Attendance
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Broadcast a dynamic, expiring QR code for enrolled students to mark presence.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                    <div>
                      <label className="sa-label">Course</label>
                      <select
                        className="sa-select"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                      >
                        {teacherCourses.map(c => (
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
                        placeholder="e.g. Distributed Database Consistency"
                        className="sa-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="sa-label">Duration</label>
                      <select
                        className="sa-select"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                      >
                        <option value={5}>5 Minutes (Quick Check-in)</option>
                        <option value={10}>10 Minutes</option>
                        <option value={15}>15 Minutes (Standard)</option>
                        <option value={30}>30 Minutes</option>
                      </select>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      icon={Play}
                      style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                      onClick={handleStartAttendance}
                    >
                      Start Attendance Session
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Live Checked-in Roster for Active Session */}
            <div className="sa-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Live Attendance Stream
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {activeSession
                        ? `Live check-ins for ${activeSession.classCode} (${activeSession.checkedInStudents?.length || 0} students)`
                        : 'Students will appear here in real-time as they scan the attendance code.'}
                    </p>
                  </div>

                  {activeSession && (
                    <Badge variant="present">● Live Updating</Badge>
                  )}
                </div>

                {activeSession && (activeSession.checkedInStudents || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                    {activeSession.checkedInStudents.map((st, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.85rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <CheckCircle2 size={16} color="var(--emerald-600)" />
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st.name}</span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                              ({st.rollNo})
                            </span>
                          </div>
                        </div>

                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {st.time}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.875rem' }}>
                      {activeSession ? 'Awaiting student check-ins...' : 'No active attendance session.'}
                    </p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      Enrolled students scan the QR code to mark themselves present.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* FULL-SCREEN PROJECTOR MODE MODAL */}
      <Modal
        isOpen={isProjectorOpen}
        onClose={() => setIsProjectorOpen(false)}
        title={activeTabMode === 'joining-qr' ? `Course Joining QR • ${selectedCourse?.code}` : `Live Attendance QR • ${activeSession?.classCode}`}
        subtitle="Display on classroom projector screen."
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
          <img
            src={activeTabMode === 'joining-qr' ? joiningQRUrl : attendanceQRUrl}
            alt="Projector QR"
            style={{ width: '300px', height: '300px', borderRadius: '16px', border: '2px solid var(--border-subtle)', marginBottom: '1.25rem' }}
          />

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {activeTabMode === 'joining-qr' ? selectedCourse?.name : activeSession?.className}
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {activeTabMode === 'joining-qr'
              ? `Course Code: ${selectedCourse?.code} • Scan with camera to enroll`
              : `Token: ${activeSession?.token} • Scan with camera to mark present`}
          </p>

          <Button variant="secondary" onClick={() => setIsProjectorOpen(false)}>
            Close Projector Mode
          </Button>
        </div>
      </Modal>
    </div>
  );
};
