import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Clock,
  Play,
  CheckCircle2,
  Calendar,
  BookOpen,
  StopCircle,
  Download,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const TeacherDashboard = () => {
  const {
    currentUser,
    classes,
    students,
    activeSession,
    startQRSession,
    stopQRSession,
    setActiveTab,
    exportAttendanceCSV,
    attendanceRecords
  } = useApp();

  // Scope to the logged-in teacher's assigned classes
  const teacherId = currentUser?.teacherId || currentUser?.id;
  const assignedIds = currentUser?.assignedClassIds || [];

  const teacherClasses = classes.filter(c =>
    c.teacherId === teacherId ||
    c.teacher === currentUser?.name ||
    assignedIds.includes(c.id)
  );

  const [selectedClassId, setSelectedClassId] = useState(teacherClasses[0]?.id || classes[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(15);

  const handleStartSession = (classId) => {
    const targetId = classId || selectedClassId;
    if (!targetId) return;
    startQRSession(targetId, topic || 'Interactive Classroom Session', duration);
    setActiveTab('qr-codes');
  };

  // Metrics for THIS teacher
  const totalClasses = teacherClasses.length;
  // Unique enrolled students across this teacher's classes
  const enrolledStudentIds = new Set();
  teacherClasses.forEach(c => {
    (c.enrolledStudentIds || []).forEach(id => enrolledStudentIds.add(id));
  });
  const totalEnrolled = enrolledStudentIds.size;

  const teacherRecords = attendanceRecords.filter(r =>
    teacherClasses.some(c => c.id === r.classId)
  );
  const presentCount = teacherRecords.filter(r => r.status === 'Present').length;
  const rate = teacherRecords.length > 0 ? Math.round((presentCount / teacherRecords.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Quick Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Faculty Portal • {currentUser?.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Teacher ID: <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{teacherId}</code> • {currentUser?.department || 'Department of Computer Science'} • {currentUser?.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={() => exportAttendanceCSV(teacherRecords, `SmartAttend_${teacherId}_Classes.csv`)}
          >
            Export Class CSV
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={Plus}
            onClick={() => setActiveTab('create-course')}
          >
            + Create Course
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={QrCode}
            disabled={teacherClasses.length === 0}
            onClick={() => handleStartSession(selectedClassId)}
          >
            Launch QR Session
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
          title="Assigned Classes"
          value={totalClasses}
          change={totalClasses > 0 ? 'Active' : 'Unassigned'}
          isPositive={totalClasses > 0}
          period="my curriculum"
          icon={BookOpen}
          accentColor="#2563eb"
        />
        <StatCard
          title="Registered Students"
          value={totalEnrolled}
          change="Enrolled"
          isPositive={totalEnrolled > 0}
          period="across my classes"
          icon={Users}
          accentColor="#4f46e5"
        />
        <StatCard
          title="My Classes Attendance"
          value={teacherRecords.length > 0 ? `${rate}%` : 'N/A'}
          change={teacherRecords.length > 0 ? `${presentCount}/${teacherRecords.length}` : '0 records'}
          isPositive={rate >= 75}
          period={teacherRecords.length > 0 ? 'verified check-ins' : 'no sessions yet'}
          icon={CheckCircle2}
          accentColor="#059669"
        />
        <StatCard
          title="Session Status"
          value={activeSession ? 'Live Stream' : 'Ready'}
          change={activeSession ? `${activeSession.checkedInStudents?.length || 0} Checked In` : 'Offline'}
          isPositive={!!activeSession}
          period="classroom hall"
          icon={Clock}
          accentColor="#d97706"
        />
      </div>

      {/* Hero QR Session Launcher Card */}
      <div
        className="sa-card"
        style={{
          padding: '1.5rem',
          background: activeSession
            ? 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'
            : 'var(--bg-surface)',
          border: activeSession ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--brand-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeSession ? `Active Session in Progress: ${activeSession.classCode}` : 'Launch Attendance Session'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {activeSession
                  ? `Topic: "${activeSession.topic}" • Started at ${activeSession.startedAt} • Token: ${activeSession.token}`
                  : 'Select one of your assigned courses, enter topic, and broadcast a dynamic QR code.'}
              </p>
            </div>
          </div>

          {activeSession ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                size="md"
                onClick={() => setActiveTab('qr-codes')}
              >
                View Live QR Code Screen →
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
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                size="md"
                icon={Play}
                disabled={teacherClasses.length === 0}
                onClick={() => handleStartSession(selectedClassId)}
              >
                Generate QR Code Now
              </Button>
            </div>
          )}
        </div>

        {/* Quick Config Inputs if no active session */}
        {!activeSession && teacherClasses.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <label className="sa-label">Select Your Course</label>
              <select
                className="sa-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {teacherClasses.map((c) => (
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
                placeholder="e.g. Distributed Consensus & Raft"
                className="sa-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="sa-label">Session Duration</label>
              <select
                className="sa-select"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={5}>5 Minutes (Quick check)</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes (Standard)</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Classes Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            My Assigned Classes ({teacherClasses.length})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            icon={Plus}
            onClick={() => setActiveTab('my-courses')}
          >
            My Courses
          </Button>
        </div>

        {teacherClasses.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {teacherClasses.map((c) => {
              const classRecs = teacherRecords.filter(r => r.classId === c.id);
              const classPres = classRecs.filter(r => r.status === 'Present').length;
              const classRate = classRecs.length > 0 ? Math.round((classPres / classRecs.length) * 100) : 0;
              const enrolledCount = (c.enrolledStudentIds || []).length;

              return (
                <div key={c.id} className="sa-card sa-card-interactive" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--brand-subtle)',
                        color: 'var(--brand-primary)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {c.code}
                    </span>
                    <Badge variant="neutral">{c.schedule}</Badge>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Room: <strong>{c.room}</strong> • Enrolled: <strong>{enrolledCount} Students</strong>
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Attendance Rate: <strong style={{ color: classRecs.length > 0 ? 'var(--emerald-600)' : 'var(--text-muted)' }}>
                        {classRecs.length > 0 ? `${classRate}%` : 'No sessions yet'}
                      </strong>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={QrCode}
                      onClick={() => handleStartSession(c.id)}
                    >
                      Start Session
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No courses created or assigned yet"
            message="You do not have any courses in your catalog yet. Click below to create your first course and generate a Course Joining QR Code."
            actionLabel="Create New Course"
            onAction={() => setActiveTab('create-course')}
          />
        )}
      </div>
    </div>
  );
};
