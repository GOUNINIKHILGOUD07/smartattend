import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  CheckCircle2,
  QrCode,
  TrendingUp,
  Download,
  Plus,
  ArrowRight,
  Clock,
  Search,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { AttendanceBarChart } from '../components/common/AttendanceChart';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const AdminDashboard = () => {
  const {
    students,
    teachers,
    classes,
    attendanceRecords,
    activeSession,
    setActiveTab,
    exportAttendanceCSV
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Calculate real metrics strictly from stored application records
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalRecords = attendanceRecords.length;
  const presentRecords = attendanceRecords.filter(r => r.status === 'Present').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner & Action Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            System Administration
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time telemetry calculated from {totalStudents} registered students, {totalTeachers} faculty members, and {totalClasses} classes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={() => exportAttendanceCSV(attendanceRecords, 'SmartAttend_Master_System_Report.csv')}
          >
            Export Master CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setActiveTab('students')}
          >
            Manage Roster
          </Button>
        </div>
      </div>

      {/* Row of 4 Compact Statistic Cards (Desktop Row) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <StatCard
          title="Registered Students"
          value={totalStudents}
          change={totalStudents > 0 ? `${totalStudents} Active` : '0 Registered'}
          isPositive={totalStudents > 0}
          period="registered directory"
          icon={Users}
          accentColor="#2563eb"
        />
        <StatCard
          title="Faculty Instructors"
          value={totalTeachers}
          change={`${totalClasses} Courses`}
          isPositive={totalTeachers > 0}
          period="active teachers"
          icon={UserCheck}
          accentColor="#4f46e5"
        />
        <StatCard
          title="System Attendance Rate"
          value={totalRecords > 0 ? `${attendanceRate}%` : 'N/A'}
          change={totalRecords > 0 ? `${presentRecords}/${totalRecords} Pres` : 'No records'}
          isPositive={attendanceRate >= 75}
          period={totalRecords > 0 ? 'calculated from check-ins' : 'awaiting sessions'}
          icon={TrendingUp}
          accentColor="#059669"
        />
        <StatCard
          title="Live QR Sessions"
          value={activeSession ? '1 Active' : '0 Idle'}
          change={activeSession ? activeSession.classCode : 'Standby'}
          isPositive={!!activeSession}
          period={activeSession ? 'in progress' : 'no active sessions'}
          icon={QrCode}
          accentColor="#d97706"
        />
      </div>

      {/* Main Grid: Attendance Trend Chart & Live Activity Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Attendance Analytics Card */}
        <div className="sa-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Attendance Rate
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Daily distribution across all registered courses
              </span>
            </div>
            <Badge variant={totalRecords > 0 ? 'brand' : 'neutral'}>
              {totalRecords > 0 ? `${attendanceRate}% Cumulative` : 'No Sessions Yet'}
            </Badge>
          </div>

          {totalRecords > 0 ? (
            <AttendanceBarChart height={170} attendanceRecords={attendanceRecords} />
          ) : (
            <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState
                icon={Calendar}
                title="No attendance activity yet"
                message="Statistics will automatically populate as faculty members start QR sessions and students check in."
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Total Attendance Records: <strong>{totalRecords} entries</strong></span>
            <span>Active Courses: <strong>{totalClasses}</strong></span>
          </div>
        </div>

        {/* Recent Attendance Activity Stream */}
        <div className="sa-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Check-in Activity
            </h3>
            <button
              onClick={() => setActiveTab('attendance-history')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              View All ({totalRecords}) <ArrowRight size={13} />
            </button>
          </div>

          {attendanceRecords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {attendanceRecords.slice(0, 4).map((record) => (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {record.studentName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {record.studentName}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {record.className} • {record.time}
                      </div>
                    </div>
                  </div>

                  <Badge variant={record.status.toLowerCase()}>{record.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No recent check-ins"
              message="When students submit QR attendance, real-time records will stream here immediately."
            />
          )}
        </div>
      </div>

      {/* Student Directory Table Preview */}
      <div className="sa-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Registered Students ({totalStudents})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Active accounts registered in the SmartAttend directory
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', width: '280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name or roll no..."
                className="sa-input"
                style={{ paddingLeft: '2.1rem', fontSize: '0.8125rem', padding: '0.45rem 0.75rem 0.45rem 2.1rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredStudents.length > 0 ? (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Institutional Email</th>
                  <th>Enrolled Courses</th>
                  <th>Calculated Attendance</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const stuRecs = attendanceRecords.filter(r => r.studentId === s.id || r.rollNo === s.rollNo);
                  const stuPres = stuRecs.filter(r => r.status === 'Present').length;
                  const stuRate = stuRecs.length > 0 ? Math.round((stuPres / stuRecs.length) * 100) : 0;

                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={s.avatar}
                            alt={s.name}
                            style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {s.rollNo}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td>
                        <Badge variant="neutral">{s.enrolledClassIds.length} Classes</Badge>
                      </td>
                      <td>
                        <Badge variant={stuRecs.length === 0 ? 'neutral' : (stuRate >= 75 ? 'present' : 'absent')}>
                          {stuRecs.length === 0 ? 'No sessions' : `${stuRate}% (${stuPres}/${stuRecs.length})`}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('students')}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No students found"
            message={`No registered students match "${searchTerm}".`}
          />
        )}
      </div>
    </div>
  );
};
