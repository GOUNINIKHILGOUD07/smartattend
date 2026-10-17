import React from 'react';
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
  Download,
  Clock,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const StudentDashboard = () => {
  const {
    currentUser,
    classes,
    attendanceRecords,
    activeSession,
    markAttendance,
    setActiveTab,
    exportAttendanceCSV
  } = useApp();

  // Scope to the logged-in student's account
  const studentId = currentUser?.id;
  const rollNo = currentUser?.studentId || currentUser?.rollNo || studentId;

  // Filter attendance records strictly for THIS logged in student
  const myRecords = attendanceRecords.filter(r =>
    r.studentId === studentId || r.rollNo === rollNo
  );

  const presentCount = myRecords.filter(r => r.status === 'Present').length;
  const totalConducted = myRecords.length;
  const attendanceRate = totalConducted > 0 ? Math.round((presentCount / totalConducted) * 100) : 0;

  // Enrolled courses for this student
  const enrolledClassIds = currentUser?.enrolledClassIds || [];
  const myClasses = classes.filter(c =>
    enrolledClassIds.includes(c.id) ||
    c.enrolledStudentIds?.includes(studentId) ||
    c.enrolledStudentIds?.includes(rollNo)
  );

  // Active session check
  const isEnrolledInActiveSession = activeSession && myClasses.some(c => c.id === activeSession.classId);

  const isAlreadyCheckedIn = activeSession && myRecords.some(
    r => r.classId === activeSession.classId && r.date === activeSession.date && r.status === 'Present'
  );

  const handleInstantCheckIn = () => {
    if (!activeSession) return;
    markAttendance(activeSession.token, studentId, 'Quick Check-in');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Active Session Callout if Teacher opened session */}
      {isEnrolledInActiveSession && (
        <div
          className="sa-card"
          style={{
            padding: '1.25rem 1.5rem',
            background: isAlreadyCheckedIn
              ? 'var(--emerald-50)'
              : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: isAlreadyCheckedIn ? '1px solid var(--emerald-200)' : '1px solid #bfdbfe',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: isAlreadyCheckedIn ? 'var(--emerald-600)' : 'var(--brand-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isAlreadyCheckedIn ? '0 4px 10px rgba(5, 150, 105, 0.25)' : '0 4px 10px rgba(37, 99, 235, 0.25)'
              }}
            >
              {isAlreadyCheckedIn ? <CheckCircle2 size={24} /> : <QrCode size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isAlreadyCheckedIn
                    ? 'Verified: You Are Checked In!'
                    : `Active Lecture: ${activeSession.classCode} in Progress`}
                </h3>
                <Badge variant={isAlreadyCheckedIn ? 'present' : 'brand'}>
                  {isAlreadyCheckedIn ? 'Present' : 'Live Check-in Open'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Course: {activeSession.className} • Topic: "{activeSession.topic}"
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isAlreadyCheckedIn ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleInstantCheckIn}
                >
                  ⚡ Quick Check-in Now
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  icon={QrCode}
                  onClick={() => setActiveTab('qr-attendance')}
                >
                  Open Camera Scanner
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('attendance-history')}
              >
                View in History →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Student Welcome Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Welcome, {currentUser?.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Student ID: <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{rollNo}</code> • {currentUser?.email} • {currentUser?.semester || 'Academic Term'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={() => exportAttendanceCSV(myRecords, `SmartAttend_${rollNo}_Records.csv`)}
          >
            Export My CSV
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={BookOpen}
            onClick={() => setActiveTab('join-course')}
          >
            + Join Course
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={QrCode}
            onClick={() => setActiveTab('scan-attendance')}
          >
            Scan Attendance
          </Button>
        </div>
      </div>

      {/* Row of 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <StatCard
          title="My Attendance Rate"
          value={totalConducted > 0 ? `${attendanceRate}%` : 'N/A'}
          change={totalConducted > 0 ? (attendanceRate >= 75 ? 'Exam Eligible' : 'Below 75%') : 'No records'}
          isPositive={attendanceRate >= 75}
          period={totalConducted > 0 ? 'target ≥ 75%' : 'awaiting sessions'}
          icon={CheckCircle2}
          accentColor="#059669"
        />
        <StatCard
          title="Sessions Attended"
          value={totalConducted > 0 ? `${presentCount} / ${totalConducted}` : '0 / 0'}
          change="Presence"
          isPositive={presentCount > 0}
          period={totalConducted > 0 ? 'recorded' : 'no classes held'}
          icon={Calendar}
          accentColor="#2563eb"
        />
        <StatCard
          title="Enrolled Courses"
          value={myClasses.length}
          change="Registered"
          isPositive={myClasses.length > 0}
          period="current semester"
          icon={BookOpen}
          accentColor="#4f46e5"
        />
        <StatCard
          title="Academic Standing"
          value={totalConducted === 0 ? 'Enrolled' : (attendanceRate >= 75 ? 'Good Standing' : 'Attendance Warning')}
          change={totalConducted === 0 ? 'Active' : (attendanceRate >= 75 ? 'Compliant' : 'Review')}
          isPositive={attendanceRate >= 75 || totalConducted === 0}
          period="faculty criteria"
          icon={GraduationCap}
          accentColor="#d97706"
        />
      </div>

      {/* Enrolled Classes Grid */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          My Enrolled Courses & Attendance Status
        </h2>

        {myClasses.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {myClasses.map((cls) => {
              const classRecs = myRecords.filter(r => r.classId === cls.id);
              const classPres = classRecs.filter(r => r.status === 'Present').length;
              const classRate = classRecs.length > 0 ? Math.round((classPres / classRecs.length) * 100) : 0;

              return (
                <div key={cls.id} className="sa-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--brand-subtle)',
                        color: 'var(--brand-primary)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {cls.code}
                    </span>
                    <Badge variant={classRecs.length === 0 ? 'neutral' : (classRate >= 75 ? 'present' : 'absent')}>
                      {classRecs.length === 0 ? 'No Sessions Yet' : `${classRate}% Attendance`}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {cls.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                    Instructor: <strong>{cls.teacher}</strong> • Room: <strong>{cls.room}</strong>
                  </p>

                  <div className="sa-progress-bar" style={{ marginBottom: '0.5rem' }}>
                    <div
                      className="sa-progress-fill"
                      style={{
                        width: `${classRecs.length === 0 ? 0 : classRate}%`,
                        background: classRate >= 75 ? 'var(--emerald-600)' : 'var(--rose-600)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    <span>{classPres} of {classRecs.length} Recorded Sessions</span>
                    <span>{classRecs.length === 0 ? 'Awaiting First Session' : (classRate >= 75 ? '✓ Exam Eligible' : '⚠️ Low Attendance')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No enrolled courses"
            message="You are not enrolled in any courses yet. Scan a course QR code provided by your instructor or enter the course code to enroll."
            actionLabel="Join Course with QR Code"
            onAction={() => setActiveTab('join-course')}
          />
        )}
      </div>

      {/* Attendance History Table for this Student */}
      <div className="sa-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              My Attendance History ({myRecords.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Your verified check-ins and session timestamps
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('attendance-history')}
          >
            Full Audit Logs →
          </Button>
        </div>

        {myRecords.length > 0 ? (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Course Code & Title</th>
                  <th>Attendance Status</th>
                  <th>Verification Method</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.date}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {r.time}
                    </td>
                    <td>{r.className}</td>
                    <td>
                      <Badge variant={r.status.toLowerCase()}>{r.status}</Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No attendance records found"
            message="You have not participated in any attendance sessions yet. When a teacher starts a session, scan the QR code to record attendance."
          />
        )}
      </div>
    </div>
  );
};
