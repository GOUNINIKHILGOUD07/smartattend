import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Search,
  Plus,
  Trash2,
  UserCheck,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const ManagementScreen = () => {
  const {
    students,
    teachers,
    classes,
    attendanceRecords,
    deleteStudent,
    addClass,
    deleteClass
  } = useApp();

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'teachers' | 'classes'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Modal states
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  const [classForm, setClassForm] = useState({
    code: '',
    name: '',
    department: 'Computer Science',
    teacher: teachers[0]?.name || '',
    teacherId: teachers[0]?.teacherId || '',
    room: '',
    schedule: ''
  });

  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!classForm.code || !classForm.name) return;
    addClass(classForm);
    setClassForm({
      code: '',
      name: '',
      department: 'Computer Science',
      teacher: teachers[0]?.name || '',
      teacherId: teachers[0]?.teacherId || '',
      room: '',
      schedule: ''
    });
    setIsAddClassOpen(false);
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClassFilter === 'ALL' ||
      (s.enrolledClassIds || []).includes(selectedClassFilter);

    return matchesSearch && matchesClass;
  });

  // Filter teachers
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.teacherId && t.teacherId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter classes
  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Academic Directory & Class Roster
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Registered student directory ({students.length}), faculty instructors ({teachers.length}), and courses ({classes.length}).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddClassOpen(true)}
          >
            Create New Course
          </Button>
        </div>
      </div>

      {/* Tabs & Filter Bar Card */}
      <div className="sa-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* 3-Way Segmented Control */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              padding: '3px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <button
              onClick={() => { setActiveTab('students'); setSearchTerm(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'students' ? '#ffffff' : 'transparent',
                color: activeTab === 'students' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'students' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <Users size={15} />
              <span>Students ({students.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('teachers'); setSearchTerm(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'teachers' ? '#ffffff' : 'transparent',
                color: activeTab === 'teachers' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'teachers' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <UserCheck size={15} />
              <span>Teachers ({teachers.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('classes'); setSearchTerm(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'classes' ? '#ffffff' : 'transparent',
                color: activeTab === 'classes' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'classes' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <BookOpen size={15} />
              <span>Classes ({classes.length})</span>
            </button>
          </div>

          {/* Search Bar & Class Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {activeTab === 'students' && (
              <select
                className="sa-select"
                style={{ width: '180px', fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
              >
                <option value="ALL">All Enrolled Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
            )}

            <div style={{ position: 'relative', width: '220px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="sa-input"
                style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.85rem 0.45rem 2.2rem', fontSize: '0.8125rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1. Students Tab */}
      {activeTab === 'students' && (
        <div className="sa-card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredStudents.length > 0 ? (
            <div className="sa-table-wrapper" style={{ border: 'none', borderRadius: '0' }}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Registered Student</th>
                    <th>Roll Number</th>
                    <th>Institutional Email</th>
                    <th>Enrolled Classes</th>
                    <th>Calculated Attendance</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                              style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.semester}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {s.rollNo}
                          </code>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {s.enrolledClassIds && s.enrolledClassIds.length > 0 ? (
                              s.enrolledClassIds.map((cid) => {
                                const foundClass = classes.find(c => c.id === cid);
                                return (
                                  <span
                                    key={cid}
                                    style={{
                                      fontSize: '0.6875rem',
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: 'var(--radius-xs)',
                                      background: 'var(--bg-subtle)',
                                      border: '1px solid var(--border-subtle)',
                                      fontFamily: 'var(--font-mono)'
                                    }}
                                  >
                                    {foundClass ? foundClass.code : cid}
                                  </span>
                                );
                              })
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                            )}
                          </div>
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
                            className="sa-btn-danger"
                            icon={Trash2}
                            onClick={() => deleteStudent(s.id)}
                            title="Remove student"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No registered students found"
              message={`No students match "${searchTerm}". New students appear here automatically upon registration.`}
            />
          )}
        </div>
      )}

      {/* 2. Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="sa-card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredTeachers.length > 0 ? (
            <div className="sa-table-wrapper" style={{ border: 'none', borderRadius: '0' }}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Faculty Member</th>
                    <th>Teacher ID</th>
                    <th>Institutional Email</th>
                    <th>Department</th>
                    <th>Assigned Classes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t) => {
                    const assignedClasses = classes.filter(c =>
                      c.teacherId === t.teacherId ||
                      c.teacher === t.name ||
                      (t.assignedClassIds || []).includes(c.id)
                    );

                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={t.avatar}
                              alt={t.name}
                              style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{t.title}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {t.teacherId}
                          </code>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.email}</td>
                        <td>
                          <Badge variant="purple">{t.department}</Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {assignedClasses.length > 0 ? (
                              assignedClasses.map(c => (
                                <span
                                  key={c.id}
                                  style={{
                                    fontSize: '0.6875rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: 'var(--radius-xs)',
                                    background: 'var(--brand-subtle)',
                                    color: 'var(--brand-primary)',
                                    border: '1px solid #bfdbfe',
                                    fontFamily: 'var(--font-mono)'
                                  }}
                                >
                                  {c.code}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None assigned</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No faculty members found"
              message={`No teachers match "${searchTerm}".`}
            />
          )}
        </div>
      )}

      {/* 3. Classes Tab */}
      {activeTab === 'classes' && (
        <div>
          {filteredClasses.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {filteredClasses.map((cls) => {
                const enrolledCount = (cls.enrolledStudentIds || []).length;
                return (
                  <div key={cls.id} className="sa-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
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
                          {cls.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="sa-btn-danger"
                          icon={Trash2}
                          onClick={() => deleteClass(cls.id)}
                          title="Delete course"
                        />
                      </div>

                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                        {cls.name}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Department: {cls.department} • Room {cls.room}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                        <div>👨‍🏫 Assigned Teacher: <strong>{cls.teacher}</strong></div>
                        <div>🗓️ Lecture Schedule: <strong>{cls.schedule}</strong></div>
                        <div>👥 Registered Students: <strong>{enrolledCount} Students Enrolled</strong></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No courses found"
              message={`No courses match "${searchTerm}".`}
              actionLabel="Create Course"
              onAction={() => setIsAddClassOpen(true)}
            />
          )}
        </div>
      )}

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        title="Create New Academic Course"
        subtitle="Add a new course to the curriculum and assign an instructor."
      >
        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div>
              <label className="sa-label">Course Code *</label>
              <input
                type="text"
                placeholder="CS-405"
                className="sa-input"
                value={classForm.code}
                onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="sa-label">Course Title *</label>
              <input
                type="text"
                placeholder="Distributed Architecture"
                className="sa-input"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="sa-label">Assigned Faculty Member</label>
            {teachers.length > 0 ? (
              <select
                className="sa-select"
                value={classForm.teacherId}
                onChange={(e) => {
                  const found = teachers.find(t => t.teacherId === e.target.value);
                  setClassForm({
                    ...classForm,
                    teacherId: e.target.value,
                    teacher: found ? found.name : 'Faculty Instructor'
                  });
                }}
              >
                <option value="">Select a Teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.teacherId}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter Instructor Name (e.g. Prof. David Miller)"
                className="sa-input"
                value={classForm.teacher}
                onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value, teacherId: 'TCH-' + Date.now().toString().slice(-4) })}
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="sa-label">Room / Hall</label>
              <input
                type="text"
                placeholder="Hall 4B"
                className="sa-input"
                value={classForm.room}
                onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
              />
            </div>
            <div>
              <label className="sa-label">Schedule</label>
              <input
                type="text"
                placeholder="Tue, Thu 10:00 AM"
                className="sa-input"
                value={classForm.schedule}
                onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsAddClassOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
