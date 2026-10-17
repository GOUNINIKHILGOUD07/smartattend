import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/common/StatCard';
import { AttendanceBarChart } from '../components/common/AttendanceChart';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

export const ReportsScreen = () => {
  const {
    currentUser,
    attendanceRecords,
    classes,
    exportAttendanceCSV
  } = useApp();

  const [selectedClass, setSelectedClass] = useState('ALL');
  const [dateRange, setDateRange] = useState('30d');

  // Role scoping: If teacher, show only their classes; if student, their records; if admin, all
  const scopedRecords = React.useMemo(() => {
    if (currentUser?.role === 'student') {
      const stuId = currentUser.id;
      const rollNo = currentUser.studentId || currentUser.rollNo || stuId;
      return attendanceRecords.filter(r => r.studentId === stuId || r.rollNo === rollNo);
    } else if (currentUser?.role === 'teacher') {
      const teacherId = currentUser.teacherId || currentUser.id;
      const assignedIds = currentUser.assignedClassIds || [];
      const teacherClasses = classes.filter(c =>
        c.teacherId === teacherId ||
        c.teacher === currentUser.name ||
        assignedIds.includes(c.id)
      );
      return attendanceRecords.filter(r => teacherClasses.some(c => c.id === r.classId));
    }
    return attendanceRecords;
  }, [currentUser, attendanceRecords, classes]);

  // Filter by selected course
  const relevantRecords = selectedClass === 'ALL'
    ? scopedRecords
    : scopedRecords.filter(r => r.classId === selectedClass);

  const total = relevantRecords.length;
  const present = relevantRecords.filter(r => r.status === 'Present').length;
  const absent = relevantRecords.filter(r => r.status === 'Absent').length;
  const late = relevantRecords.filter(r => r.status === 'Late').length;
  const overallRate = total > 0 ? Math.round((present / total) * 100) : 0;

  // Compute breakdown per class
  const classBreakdown = classes.map((c) => {
    const classRecs = scopedRecords.filter(r => r.classId === c.id);
    const pres = classRecs.filter(r => r.status === 'Present').length;
    const rate = classRecs.length > 0 ? Math.round((pres / classRecs.length) * 100) : 0;
    return {
      ...c,
      totalSessions: classRecs.length,
      presentCount: pres,
      rate
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header & CSV Action */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Attendance Analytics & Reports
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Aggregated institutional telemetry and downloadable verified records.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Download}
          disabled={relevantRecords.length === 0}
          onClick={() => exportAttendanceCSV(relevantRecords, `SmartAttend_${selectedClass}_Analytics.csv`)}
        >
          Export CSV Report
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="sa-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <label className="sa-label">Course Filter</label>
              <select
                className="sa-select"
                style={{ width: '240px', fontSize: '0.8125rem' }}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="ALL">All Available Courses</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="sa-label">Reporting Period</label>
              <select
                className="sa-select"
                style={{ width: '180px', fontSize: '0.8125rem' }}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="sem">Current Semester</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Total Analyzed: <strong>{relevantRecords.length} records</strong>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <StatCard
          title="Attendance Rate"
          value={total > 0 ? `${overallRate}%` : 'N/A'}
          change={total > 0 ? (overallRate >= 75 ? 'Healthy' : 'Low') : 'No records'}
          isPositive={overallRate >= 75}
          period={total > 0 ? 'actual check-ins' : 'awaiting sessions'}
          icon={TrendingUp}
          accentColor="#059669"
        />
        <StatCard
          title="Present Records"
          value={present}
          change="Verified"
          isPositive={present > 0}
          period="successful scans"
          icon={CheckCircle2}
          accentColor="#2563eb"
        />
        <StatCard
          title="Absence Incidents"
          value={absent}
          change={absent > 0 ? `${absent} absent` : '0 absent'}
          isPositive={absent === 0}
          period="unverified sessions"
          icon={XCircle}
          accentColor="#e11d48"
        />
        <StatCard
          title="Compliance Standing"
          value={total === 0 ? 'Pending' : (overallRate >= 75 ? 'Compliant' : 'Warning')}
          change={total > 0 ? `${total} sessions` : '0 sessions'}
          isPositive={overallRate >= 75 || total === 0}
          period="institutional target ≥75%"
          icon={Award}
          accentColor="#d97706"
        />
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Weekly Trend Bar Chart */}
        <div className="sa-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Weekly Check-in Velocity
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Presence calculated from actual attendance records
              </p>
            </div>
            <Badge variant={total > 0 ? 'brand' : 'neutral'}>
              {total > 0 ? `${overallRate}% Overall` : 'No Activity'}
            </Badge>
          </div>

          {total > 0 ? (
            <AttendanceBarChart height={180} attendanceRecords={relevantRecords} />
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState
                icon={Calendar}
                title="No report data"
                message="Weekly distribution will be rendered as attendance check-ins are logged."
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Target criteria: <strong>75%</strong></span>
            <span>Recorded entries: <strong>{total}</strong></span>
          </div>
        </div>

        {/* Course-by-Course Comparison Breakdown */}
        <div className="sa-card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Course Breakdown & Compliance
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Actual attendance rates per course
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {classBreakdown.map((c) => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.code}: {c.name}
                  </span>
                  <strong style={{ color: c.totalSessions === 0 ? 'var(--text-muted)' : (c.rate >= 75 ? 'var(--emerald-600)' : 'var(--rose-600)') }}>
                    {c.totalSessions === 0 ? 'No sessions' : `${c.rate}% (${c.presentCount}/${c.totalSessions})`}
                  </strong>
                </div>

                <div className="sa-progress-bar">
                  <div
                    className="sa-progress-fill"
                    style={{
                      width: `${c.totalSessions === 0 ? 0 : c.rate}%`,
                      background: c.rate >= 75 ? 'var(--emerald-600)' : 'var(--brand-primary)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Course Ledger Table */}
      <div className="sa-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Class-Level Audit Summary
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Course-level summary computed from stored records
          </p>
        </div>

        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Course Code & Title</th>
                <th>Instructor</th>
                <th>Enrolled Students</th>
                <th>Recorded Sessions</th>
                <th>Present Ratio</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {classBreakdown.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.code}</strong> • {c.name}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.teacher}</td>
                  <td>{(c.enrolledStudentIds || []).length} Students</td>
                  <td>{c.totalSessions} Sessions</td>
                  <td>
                    <span style={{ fontWeight: 600, color: c.totalSessions > 0 ? 'var(--emerald-600)' : 'var(--text-muted)' }}>
                      {c.presentCount} / {c.totalSessions}
                    </span>{' '}
                    {c.totalSessions > 0 ? `(${c.rate}%)` : ''}
                  </td>
                  <td>
                    <Badge variant={c.totalSessions === 0 ? 'neutral' : (c.rate >= 75 ? 'present' : 'absent')}>
                      {c.totalSessions === 0 ? 'Pending Sessions' : (c.rate >= 75 ? 'Compliant' : 'Under Review')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
