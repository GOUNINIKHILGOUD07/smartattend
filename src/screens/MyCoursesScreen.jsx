import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  QrCode,
  Users,
  Clock,
  Play,
  Calendar,
  Layers,
  Edit,
  Trash2,
  CheckCircle2,
  Copy,
  Download,
  Maximize2,
  Eye,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const MyCoursesScreen = ({ initialCreateMode = false }) => {
  const {
    currentUser,
    classes,
    createCourse,
    updateCourse,
    deleteCourse,
    startQRSession,
    setActiveTab,
    accounts,
    showToast
  } = useApp();

  // Scope to current teacher
  const teacherId = currentUser?.teacherId || currentUser?.id;
  const teacherCourses = currentUser?.role === 'teacher'
    ? classes.filter(c => c.teacherId === teacherId || c.teacher === currentUser?.name || (currentUser.assignedClassIds || []).includes(c.id))
    : classes;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateMode);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseForQR, setSelectedCourseForQR] = useState(null);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);
  const [joiningQRUrl, setJoiningQRUrl] = useState('');

  // Course Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subject: '',
    department: 'Computer Science',
    description: '',
    schedule: '',
    room: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      subject: '',
      department: 'Computer Science',
      description: '',
      schedule: '',
      room: ''
    });
    setEditingCourse(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      subject: course.subject || '',
      department: course.department || 'Computer Science',
      description: course.description || '',
      schedule: course.schedule || '',
      room: course.room || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
    } else {
      createCourse(formData);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  // Generate Course Joining QR Code
  const handleOpenJoiningQR = async (course) => {
    setSelectedCourseForQR(course);
    // Payload specifically for joining this course
    const payload = JSON.stringify({
      type: 'COURSE_JOIN',
      app: 'SmartAttend',
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      teacher: course.teacher
    });

    try {
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setJoiningQRUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast('Code Copied', `Course Code "${code}" copied to clipboard!`);
  };

  const handleDownloadQR = (course) => {
    if (!joiningQRUrl) return;
    const link = document.createElement('a');
    link.href = joiningQRUrl;
    link.download = `Join_Course_${course.code}.png`;
    link.click();
  };

  const handleStartAttendance = (courseId) => {
    startQRSession(courseId, 'Regular Lecture Attendance', 15);
    setActiveTab('qr-codes');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Action */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Course Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Manage courses created for {currentUser?.name || 'Faculty'}, generate student joining QR codes, and trigger sessions.
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
          Create New Course
        </Button>
      </div>

      {/* Courses Grid */}
      {teacherCourses.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {teacherCourses.map((c) => {
            const enrolledCount = (c.enrolledStudentIds || []).length;

            return (
              <div
                key={c.id}
                className="sa-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        padding: '0.25rem 0.6rem',
                        background: 'var(--brand-subtle)',
                        color: 'var(--brand-primary)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {c.code}
                    </span>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Edit Course"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => deleteCourse(c.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--rose-600)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Delete Course"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Subject */}
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {c.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>
                    {c.subject || c.department}
                  </div>

                  {c.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                      {c.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <span>📍 Room: <strong>{c.room || 'TBD'}</strong></span>
                    <span>•</span>
                    <span>🕒 {c.schedule || 'Schedule TBD'}</span>
                  </div>
                </div>

                {/* Footer Controls & Actions */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <Users size={16} color="var(--brand-primary)" />
                      <span><strong>{enrolledCount}</strong> Students Enrolled</span>
                    </div>

                    <button
                      onClick={() => setSelectedCourseForDetails(c)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--brand-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <Eye size={13} /> View Roster
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={QrCode}
                      onClick={() => handleOpenJoiningQR(c)}
                    >
                      Joining QR
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Play}
                      onClick={() => handleStartAttendance(c.id)}
                    >
                      Start Attendance
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses created yet"
          message="Create your first classroom course to start generating joining QR codes and collecting attendance."
          actionLabel="Create Course Now"
          onAction={handleOpenCreate}
        />
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingCourse ? `Edit Course • ${editingCourse.code}` : 'Create New Academic Course'}
        subtitle="Publish a course to allow students to enroll via camera QR scanning or manual code entry."
      >
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '0.75rem' }}>
            <div>
              <label className="sa-label">Course Code *</label>
              <input
                type="text"
                placeholder="e.g. CS-301"
                className="sa-input"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div>
              <label className="sa-label">Course Title / Name *</label>
              <input
                type="text"
                placeholder="e.g. Distributed Cloud Computing"
                className="sa-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="sa-label">Subject</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                className="sa-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="sa-label">Class / Department</label>
              <input
                type="text"
                placeholder="e.g. B.Tech CS 3rd Year"
                className="sa-input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="sa-label">Course Description</label>
            <textarea
              className="sa-input"
              rows={2}
              placeholder="Brief course objectives and overview for enrolled students..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="sa-label">Lecture Schedule (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Mon, Wed 10:00 AM"
                className="sa-input"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              />
            </div>

            <div>
              <label className="sa-label">Classroom / Hall (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Hall 4B"
                className="sa-input"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCourse ? 'Save Changes' : 'Publish Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* COURSE JOINING QR CODE MODAL (Distinct from Attendance QR) */}
      <Modal
        isOpen={!!selectedCourseForQR}
        onClose={() => setSelectedCourseForQR(null)}
        title={`Course Joining QR Code • ${selectedCourseForQR?.code}`}
        subtitle="Students scan this QR code with their camera or type the code to enroll into this course."
      >
        {selectedCourseForQR && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* QR Canvas Box */}
            <div
              style={{
                padding: '1.25rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {joiningQRUrl ? (
                <img
                  src={joiningQRUrl}
                  alt={`Joining QR for ${selectedCourseForQR.code}`}
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '220px', height: '220px' }} />
              )}
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {selectedCourseForQR.name}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Instructor: <strong>{selectedCourseForQR.teacher}</strong> • Dept: {selectedCourseForQR.department}
            </p>

            {/* Manual Code Card */}
            <div
              style={{
                width: '100%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Manual Joining Course Code
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  {selectedCourseForQR.code}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={Copy}
                onClick={() => handleCopyCode(selectedCourseForQR.code)}
              >
                Copy Code
              </Button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <Button
                variant="secondary"
                size="md"
                icon={Download}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleDownloadQR(selectedCourseForQR)}
              >
                Save QR Image
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Play}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  const cId = selectedCourseForQR.id;
                  setSelectedCourseForQR(null);
                  handleStartAttendance(cId);
                }}
              >
                Start Attendance Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ENROLLED STUDENTS ROSTER MODAL */}
      <Modal
        isOpen={!!selectedCourseForDetails}
        onClose={() => setSelectedCourseForDetails(null)}
        title={`Enrolled Students • ${selectedCourseForDetails?.code}`}
        subtitle={`${selectedCourseForDetails?.name} (${(selectedCourseForDetails?.enrolledStudentIds || []).length} registered students)`}
      >
        {selectedCourseForDetails && (
          <div>
            {(selectedCourseForDetails.enrolledStudentIds || []).length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll Number</th>
                      <th>Institutional Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCourseForDetails.enrolledStudentIds.map(stuId => {
                      const student = accounts.find(a => a.id === stuId || a.studentId === stuId);
                      return (
                        <tr key={stuId}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {student?.name || stuId}
                          </td>
                          <td>
                            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                              {student?.rollNo || student?.studentId || '—'}
                            </code>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {student?.email || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                <Users size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.875rem' }}>No students enrolled in this course yet.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Students can join by scanning the <strong>Course Joining QR Code</strong> or entering course code <strong>{selectedCourseForDetails.code}</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
