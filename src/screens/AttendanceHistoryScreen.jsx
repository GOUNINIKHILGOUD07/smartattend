import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

export const AttendanceHistoryScreen = () => {
  const {
    currentUser,
    attendanceRecords,
    classes,
    exportAttendanceCSV
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // 1. Role-based scoping
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
    return attendanceRecords; // Admin sees all
  }, [currentUser, attendanceRecords, classes]);

  // 2. User-applied filters
  const filteredRecords = scopedRecords.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || rec.classId === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || rec.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesDate = !dateFilter || rec.date === dateFilter;

    return matchesSearch && matchesClass && matchesStatus && matchesDate;
  });

  const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
  const absentCount = filteredRecords.filter(r => r.status === 'Absent').length;
  const lateCount = filteredRecords.filter(r => r.status === 'Late').length;
  const filteredRate = filteredRecords.length > 0 ? Math.round((presentCount / filteredRecords.length) * 100) : 0;

  // Available classes for filter dropdown
  const filterClasses = currentUser?.role === 'teacher'
    ? classes.filter(c =>
        c.teacherId === (currentUser.teacherId || currentUser.id) ||
        c.teacher === currentUser.name ||
        (currentUser.assignedClassIds || []).includes(c.id)
      )
    : classes;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {currentUser?.role === 'student' ? 'My Attendance Records' : 'Attendance History & Audit Logs'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {currentUser?.role === 'student'
              ? `Personal attendance records for ${currentUser.name} (${currentUser.studentId || currentUser.rollNo})`
              : `Showing records scoped to ${currentUser?.role === 'teacher' ? 'your assigned courses' : 'institutional registry'}.`}
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={Download}
          disabled={filteredRecords.length === 0}
          onClick={() => exportAttendanceCSV(filteredRecords, `SmartAttend_${currentUser?.role || 'History'}_Export.csv`)}
        >
          Export Filtered CSV ({filteredRecords.length})
        </Button>
      </div>

      {/* Filter Bar Card */}
      <div className="sa-card" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          {/* Search (only needed for teacher/admin) */}
          {currentUser?.role !== 'student' && (
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search student or roll no..."
                className="sa-input"
                style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.85rem 0.45rem 2.2rem', fontSize: '0.8125rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Class Filter */}
          <div>
            <select
              className="sa-select"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="ALL">All Available Courses</option>
              {filterClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="sa-select"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
              <option value="Late">Late Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              className="sa-input"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Filter Summaries */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Filtered: <strong>{filteredRecords.length} records</strong></span>
            <span>Present: <strong style={{ color: 'var(--emerald-600)' }}>{presentCount}</strong></span>
            <span>Absent: <strong style={{ color: 'var(--rose-600)' }}>{absentCount}</strong></span>
            <span>Late: <strong style={{ color: 'var(--amber-600)' }}>{lateCount}</strong></span>
          </div>

          <div>
            Attendance Rate: <strong>{filteredRecords.length > 0 ? `${filteredRate}%` : 'N/A'}</strong>
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredRecords.length > 0 ? (
          <div className="sa-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Course Code & Title</th>
                  <th>Session Date</th>
                  <th>Time Verified</th>
                  <th>Status</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}
                        >
                          {r.studentName.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.studentName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {r.rollNo}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>{r.className}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {r.date}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {r.time}
                    </td>
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
            title="No records found"
            message={scopedRecords.length === 0
              ? 'No attendance sessions have been logged yet.'
              : 'No records match your active search or filter criteria.'}
            actionLabel={scopedRecords.length > 0 ? 'Clear Filters' : undefined}
            onAction={() => {
              setSearchTerm('');
              setSelectedClass('ALL');
              setSelectedStatus('ALL');
              setDateFilter('');
            }}
          />
        )}
      </div>
    </div>
  );
};
