/**
 * SmartAttend Data Store & Persistence Layer
 * Uses localStorage with automatic initial mock data seeding.
 */

const STORAGE_KEYS = {
  USERS: 'smartattend_users',
  CLASSES: 'smartattend_classes',
  SESSIONS: 'smartattend_sessions',
  RECORDS: 'smartattend_records',
  CURRENT_USER: 'smartattend_current_user',
  SEEDED: 'smartattend_is_seeded_v1'
};

// Initial Seed Data
const DEFAULT_USERS = [
  {
    id: 'u-admin-1',
    username: 'admin',
    password: 'password123',
    name: 'Dr. Evelyn Vance',
    role: 'admin',
    email: 'admin@smartattend.edu',
    department: 'Administration',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-teach-1',
    username: 'sarah',
    password: 'password123',
    name: 'Prof. Sarah Connor',
    role: 'teacher',
    email: 'sarah.connor@smartattend.edu',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-teach-2',
    username: 'marcus',
    password: 'password123',
    name: 'Prof. Marcus Wright',
    role: 'teacher',
    email: 'marcus.wright@smartattend.edu',
    department: 'Software Engineering',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-stud-1',
    username: 'alex',
    password: 'password123',
    name: 'Alex Mercer',
    role: 'student',
    email: 'alex.mercer@student.smartattend.edu',
    rollNo: 'CS2026-042',
    classId: 'cls-1',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-stud-2',
    username: 'priya',
    password: 'password123',
    name: 'Priya Sharma',
    role: 'student',
    email: 'priya.sharma@student.smartattend.edu',
    rollNo: 'CS2026-088',
    classId: 'cls-1',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-stud-3',
    username: 'liam',
    password: 'password123',
    name: 'Liam Chen',
    role: 'student',
    email: 'liam.chen@student.smartattend.edu',
    rollNo: 'CS2026-104',
    classId: 'cls-2',
    department: 'Software Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-stud-4',
    username: 'sophia',
    password: 'password123',
    name: 'Sophia Rodriguez',
    role: 'student',
    email: 'sophia.r@student.smartattend.edu',
    rollNo: 'CS2026-119',
    classId: 'cls-1',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-stud-5',
    username: 'david',
    password: 'password123',
    name: 'David Kim',
    role: 'student',
    email: 'david.kim@student.smartattend.edu',
    rollNo: 'CS2026-135',
    classId: 'cls-2',
    department: 'Software Engineering',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_CLASSES = [
  {
    id: 'cls-1',
    code: 'CS-301',
    name: 'Cloud Computing & Distributed Systems',
    teacherId: 'u-teach-1',
    teacherName: 'Prof. Sarah Connor',
    schedule: 'Mon / Wed 10:00 AM - 11:30 AM',
    room: 'Hall B-204',
    color: '#6366f1'
  },
  {
    id: 'cls-2',
    code: 'SE-204',
    name: 'Software Architecture & Design Patterns',
    teacherId: 'u-teach-2',
    teacherName: 'Prof. Marcus Wright',
    schedule: 'Tue / Thu 02:00 PM - 03:30 PM',
    room: 'Lab Tech-3',
    color: '#06b6d4'
  },
  {
    id: 'cls-3',
    code: 'AI-402',
    name: 'Deep Learning & Neural Networks',
    teacherId: 'u-teach-1',
    teacherName: 'Prof. Sarah Connor',
    schedule: 'Friday 09:00 AM - 12:00 PM',
    room: 'Auditorium 1',
    color: '#ec4899'
  }
];

const DEFAULT_SESSIONS = [
  {
    id: 'sess-past-1',
    classId: 'cls-1',
    className: 'Cloud Computing & Distributed Systems',
    classCode: 'CS-301',
    topic: 'Microservices & Container Orchestration',
    teacherId: 'u-teach-1',
    teacherName: 'Prof. Sarah Connor',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
    token: 'SA-CLOUD-01',
    active: false
  },
  {
    id: 'sess-past-2',
    classId: 'cls-2',
    className: 'Software Architecture & Design Patterns',
    classCode: 'SE-204',
    topic: 'Creational & Structural Patterns Review',
    teacherId: 'u-teach-2',
    teacherName: 'Prof. Marcus Wright',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 + 1800000).toISOString(),
    token: 'SA-ARCH-02',
    active: false
  }
];

const DEFAULT_RECORDS = [
  {
    id: 'rec-1',
    sessionId: 'sess-past-1',
    classId: 'cls-1',
    className: 'Cloud Computing & Distributed Systems',
    classCode: 'CS-301',
    studentId: 'u-stud-1',
    studentName: 'Alex Mercer',
    rollNo: 'CS2026-042',
    timestamp: new Date(Date.now() - 86400000 * 2 + 300000).toISOString(),
    status: 'Present',
    method: 'QR Camera'
  },
  {
    id: 'rec-2',
    sessionId: 'sess-past-1',
    classId: 'cls-1',
    className: 'Cloud Computing & Distributed Systems',
    classCode: 'CS-301',
    studentId: 'u-stud-2',
    studentName: 'Priya Sharma',
    rollNo: 'CS2026-088',
    timestamp: new Date(Date.now() - 86400000 * 2 + 450000).toISOString(),
    status: 'Present',
    method: 'QR Camera'
  },
  {
    id: 'rec-3',
    sessionId: 'sess-past-1',
    classId: 'cls-1',
    className: 'Cloud Computing & Distributed Systems',
    classCode: 'CS-301',
    studentId: 'u-stud-4',
    studentName: 'Sophia Rodriguez',
    rollNo: 'CS2026-119',
    timestamp: new Date(Date.now() - 86400000 * 2 + 800000).toISOString(),
    status: 'Late',
    method: 'QR Image'
  },
  {
    id: 'rec-4',
    sessionId: 'sess-past-2',
    classId: 'cls-2',
    className: 'Software Architecture & Design Patterns',
    classCode: 'SE-204',
    studentId: 'u-stud-3',
    studentName: 'Liam Chen',
    rollNo: 'CS2026-104',
    timestamp: new Date(Date.now() - 86400000 + 200000).toISOString(),
    status: 'Present',
    method: 'QR Camera'
  },
  {
    id: 'rec-5',
    sessionId: 'sess-past-2',
    classId: 'cls-2',
    className: 'Software Architecture & Design Patterns',
    classCode: 'SE-204',
    studentId: 'u-stud-5',
    studentName: 'David Kim',
    rollNo: 'CS2026-135',
    timestamp: new Date(Date.now() - 86400000 + 350000).toISOString(),
    status: 'Present',
    method: 'QR Camera'
  }
];

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SEEDED)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(DEFAULT_RECORDS));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    this.emitChange('data-reset');
  }

  // --- Users ---
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByUsername(username) {
    return this.getUsers().find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  }

  getStudents() {
    return this.getUsers().filter(u => u.role === 'student');
  }

  getTeachers() {
    return this.getUsers().filter(u => u.role === 'teacher');
  }

  addStudent(studentData) {
    const users = this.getUsers();
    const id = 'u-stud-' + Date.now();
    const newStudent = {
      id,
      role: 'student',
      username: studentData.username || studentData.rollNo.toLowerCase().replace(/[^a-z0-9]/g, ''),
      password: studentData.password || 'password123',
      name: studentData.name,
      rollNo: studentData.rollNo,
      email: studentData.email,
      classId: studentData.classId || 'cls-1',
      department: studentData.department || 'Computer Science',
      avatar: studentData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.name}`
    };
    users.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.emitChange('users-updated');
    return newStudent;
  }

  updateStudent(id, studentData) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...studentData };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.emitChange('users-updated');
      return users[idx];
    }
    return null;
  }

  deleteStudent(id) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.emitChange('users-updated');
  }

  // --- Classes ---
  getClasses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES)) || [];
    } catch {
      return [];
    }
  }

  getClassById(id) {
    return this.getClasses().find(c => c.id === id);
  }

  addClass(classData) {
    const classes = this.getClasses();
    const teacher = this.getUserById(classData.teacherId);
    const newClass = {
      id: 'cls-' + Date.now(),
      code: classData.code.toUpperCase(),
      name: classData.name,
      teacherId: classData.teacherId,
      teacherName: teacher ? teacher.name : 'Unknown Teacher',
      schedule: classData.schedule || 'TBD',
      room: classData.room || 'Room TBA',
      color: classData.color || '#4f46e5'
    };
    classes.push(newClass);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    this.emitChange('classes-updated');
    return newClass;
  }

  updateClass(id, classData) {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (classData.teacherId) {
        const teacher = this.getUserById(classData.teacherId);
        if (teacher) classData.teacherName = teacher.name;
      }
      classes[idx] = { ...classes[idx], ...classData };
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      this.emitChange('classes-updated');
      return classes[idx];
    }
    return null;
  }

  deleteClass(id) {
    let classes = this.getClasses();
    classes = classes.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    this.emitChange('classes-updated');
  }

  // --- Attendance Sessions ---
  getSessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS)) || [];
    } catch {
      return [];
    }
  }

  getActiveSessions() {
    const now = Date.now();
    return this.getSessions().filter(s => s.active && new Date(s.expiresAt).getTime() > now);
  }

  getActiveSessionForTeacher(teacherId) {
    const now = Date.now();
    return this.getSessions().find(s => s.active && s.teacherId === teacherId && new Date(s.expiresAt).getTime() > now);
  }

  getSessionById(sessionId) {
    return this.getSessions().find(s => s.id === sessionId);
  }

  createSession({ classId, topic, durationMinutes = 15, teacherId }) {
    const sessions = this.getSessions();
    const cls = this.getClassById(classId);
    const teacher = this.getUserById(teacherId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const token = 'SA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Deactivate any currently active session for this teacher to prevent overlap
    sessions.forEach(s => {
      if (s.teacherId === teacherId && s.active) {
        s.active = false;
      }
    });

    const newSession = {
      id: 'sess-' + Date.now(),
      classId,
      className: cls ? cls.name : 'General Attendance',
      classCode: cls ? cls.code : 'GEN',
      topic: topic || 'Regular Lecture',
      teacherId,
      teacherName: teacher ? teacher.name : 'Instructor',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      durationMinutes,
      token,
      active: true
    };

    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    this.emitChange('sessions-updated');
    return newSession;
  }

  endSession(sessionId) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.active = false;
      session.expiresAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      this.emitChange('sessions-updated');
    }
  }

  // --- Attendance Records ---
  getRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS)) || [];
    } catch {
      return [];
    }
  }

  getRecordsForSession(sessionId) {
    return this.getRecords().filter(r => r.sessionId === sessionId);
  }

  getRecordsForStudent(studentId) {
    return this.getRecords().filter(r => r.studentId === studentId);
  }

  hasStudentAttended(sessionId, studentId) {
    return this.getRecords().some(r => r.sessionId === sessionId && r.studentId === studentId);
  }

  recordAttendance({ sessionId, studentId, method = 'QR Camera', status = 'Present' }) {
    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found.');
    }

    if (!session.active || new Date(session.expiresAt).getTime() < Date.now()) {
      throw new Error('This attendance session has expired or been closed.');
    }

    const student = this.getUserById(studentId);
    if (!student) {
      throw new Error('Student account not found.');
    }

    if (this.hasStudentAttended(sessionId, studentId)) {
      throw new Error(`Attendance has already been recorded for ${student.name} in this session.`);
    }

    const records = this.getRecords();
    const newRecord = {
      id: 'rec-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      sessionId: session.id,
      classId: session.classId,
      className: session.className,
      classCode: session.classCode,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo || 'N/A',
      timestamp: new Date().toISOString(),
      status,
      method
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    this.emitChange('records-updated');
    return newRecord;
  }

  manualMarkAttendance({ sessionId, studentId, status = 'Present' }) {
    const session = this.getSessionById(sessionId);
    if (!session) throw new Error('Session not found.');

    const student = this.getUserById(studentId);
    if (!student) throw new Error('Student not found.');

    const records = this.getRecords();
    const existingIndex = records.findIndex(r => r.sessionId === sessionId && r.studentId === studentId);

    if (existingIndex !== -1) {
      records[existingIndex].status = status;
      records[existingIndex].method = 'Manual Override';
      records[existingIndex].timestamp = new Date().toISOString();
    } else {
      records.unshift({
        id: 'rec-manual-' + Date.now(),
        sessionId: session.id,
        classId: session.classId,
        className: session.className,
        classCode: session.classCode,
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo || 'N/A',
        timestamp: new Date().toISOString(),
        status,
        method: 'Manual Entry'
      });
    }

    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    this.emitChange('records-updated');
  }

  // --- Statistics Helpers ---
  getSystemStats() {
    const students = this.getStudents();
    const classes = this.getClasses();
    const sessions = this.getSessions();
    const records = this.getRecords();

    // Today's records
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRecords = records.filter(r => r.timestamp.slice(0, 10) === todayStr);

    // Calculate approximate overall attendance rate
    const totalPossible = sessions.length * students.length;
    const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const attendanceRate = totalPossible > 0 ? Math.min(100, Math.round((presentCount / totalPossible) * 100)) : 88;

    return {
      totalStudents: students.length,
      totalClasses: classes.length,
      totalSessions: sessions.length,
      todayRecords: todayRecords.length,
      attendanceRate: Math.max(15, attendanceRate)
    };
  }

  getStudentStats(studentId) {
    const student = this.getUserById(studentId);
    if (!student) return { rate: 0, attended: 0, total: 0 };

    const records = this.getRecordsForStudent(studentId);
    // Total sessions applicable to student's class
    const relevantSessions = this.getSessions().filter(s => !student.classId || s.classId === student.classId);
    const totalSessions = Math.max(relevantSessions.length, records.length);
    const attendedCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;

    const rate = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 100;

    return {
      rate,
      attended: attendedCount,
      total: totalSessions,
      records
    };
  }

  // --- Multi-tab / Event system ---
  emitChange(eventName) {
    window.dispatchEvent(new CustomEvent('smartattend-store-change', { detail: { eventName } }));
  }
}

// Global singleton instance
window.SmartStore = new DataStore();
