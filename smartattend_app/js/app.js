/**
 * SmartAttend Main Application Controller
 * Handles views, user interactions, modals, dashboards, and CSV export.
 */

document.addEventListener('DOMContentLoaded', () => {
  window.SmartApp = new SmartAttendanceApp();
  window.SmartApp.init();
});

class SmartAttendanceApp {
  constructor() {
    this.currentView = 'login';
    this.activeSessionCheckInterval = null;
    this.teacherTimerInterval = null;
  }

  init() {
    this.bindEvents();
    this.listenToStoreChanges();
    this.checkInitialSession();
  }

  bindEvents() {
    // --- Login Events ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('login-name') ? document.getElementById('login-name').value : '';
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        try {
          const user = window.SmartAuth.login(name, username, password);
          this.showToast(`Welcome back, ${user.name}!`, 'success');
          this.renderViewForUser(user);
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    // Quick Login buttons
    document.querySelectorAll('[data-quick-login]').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-quick-login');
        try {
          const user = window.SmartAuth.quickLogin(role);
          this.showToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`, 'success');
          this.renderViewForUser(user);
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    });

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.SmartScanner.stopCamera();
        window.SmartAuth.logout();
        this.showToast('You have been logged out.', 'info');
        this.showView('login');
      });
    }

    // Role quick-switcher in nav
    document.querySelectorAll('[data-switch-role]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const role = el.getAttribute('data-switch-role');
        window.SmartScanner.stopCamera();
        const user = window.SmartAuth.quickLogin(role);
        this.showToast(`Switched role to ${role.toUpperCase()} (${user.name})`, 'info');
        this.renderViewForUser(user);
      });
    });

    // Reset Demo Data
    const resetDataBtn = document.getElementById('btn-reset-data');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to restore the default sample data? Any newly created sessions and records will be reset.')) {
          window.SmartStore.resetToDefaults();
          this.showToast('Demo data successfully restored to factory defaults.', 'success');
          const user = window.SmartAuth.getCurrentUser();
          if (user) this.renderViewForUser(user);
        }
      });
    }

    // Modal close triggers
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        this.closeModal(modalId);
      });
    });

    // --- Admin Action Events ---
    this.bindAdminEvents();

    // --- Teacher Action Events ---
    this.bindTeacherEvents();

    // --- Student Action Events ---
    this.bindStudentEvents();

    // --- Export Events ---
    document.querySelectorAll('[data-export-csv]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-export-csv');
        this.handleExportCSV(type);
      });
    });
  }

  listenToStoreChanges() {
    window.addEventListener('smartattend-store-change', (e) => {
      const user = window.SmartAuth.getCurrentUser();
      if (!user) return;

      // Realtime refresh relevant views
      if (user.role === 'admin') {
        this.renderAdminView();
      } else if (user.role === 'teacher') {
        this.renderTeacherView();
      } else if (user.role === 'student') {
        this.renderStudentView();
      }
    });

    window.addEventListener('smartattend-auth-change', (e) => {
      const user = e.detail.user;
      if (user) {
        this.renderViewForUser(user);
      } else {
        this.showView('login');
      }
    });
  }

  checkInitialSession() {
    const user = window.SmartAuth.getCurrentUser();
    if (user) {
      this.renderViewForUser(user);
    } else {
      this.showView('login');
    }
  }

  renderViewForUser(user) {
    this.updateUserHeader(user);
    if (user.role === 'admin') {
      this.showView('admin');
      this.renderAdminView();
    } else if (user.role === 'teacher') {
      this.showView('teacher');
      this.renderTeacherView();
    } else if (user.role === 'student') {
      this.showView('student');
      this.renderStudentView();
    }
  }

  showView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.add('hidden');
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.remove('hidden');
    }

    const header = document.getElementById('app-header');
    if (header) {
      if (viewName === 'login') {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
    }
  }

  updateUserHeader(user) {
    if (!user) return;
    const nameEl = document.getElementById('nav-user-name');
    const roleEl = document.getElementById('nav-user-role');
    const avatarEl = document.getElementById('nav-user-avatar');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) {
      roleEl.textContent = user.role.toUpperCase();
      roleEl.className = `role-badge badge-${user.role}`;
    }
    if (avatarEl && user.avatar) {
      avatarEl.src = user.avatar;
    }
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================
  renderAdminView() {
    const stats = window.SmartStore.getSystemStats();

    // Stats
    const elStuds = document.getElementById('admin-stat-students');
    const elClasses = document.getElementById('admin-stat-classes');
    const elToday = document.getElementById('admin-stat-today');
    const elRate = document.getElementById('admin-stat-rate');

    if (elStuds) elStuds.textContent = stats.totalStudents;
    if (elClasses) elClasses.textContent = stats.totalClasses;
    if (elToday) elToday.textContent = stats.todayRecords;
    if (elRate) elRate.textContent = stats.attendanceRate + '%';

    // Roster
    this.renderAdminStudentsTable();
    // Classes
    this.renderAdminClassesTable();
    // System Records
    this.renderAdminRecordsTable();
  }

  renderAdminStudentsTable() {
    const container = document.getElementById('admin-students-list');
    if (!container) return;

    const students = window.SmartStore.getStudents();
    const classes = window.SmartStore.getClasses();
    const searchFilter = (document.getElementById('admin-student-search')?.value || '').toLowerCase();
    const classFilter = document.getElementById('admin-student-class-filter')?.value || 'all';

    const filtered = students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchFilter) ||
                          (s.rollNo && s.rollNo.toLowerCase().includes(searchFilter)) ||
                          s.email.toLowerCase().includes(searchFilter);
      const matchClass = classFilter === 'all' || s.classId === classFilter;
      return matchSearch && matchClass;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-muted">No students match your search criteria.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(s => {
      const cls = classes.find(c => c.id === s.classId);
      const className = cls ? `${cls.code} - ${cls.name}` : 'Not Assigned';
      const stats = window.SmartStore.getStudentStats(s.id);

      return `
        <tr>
          <td>
            <div class="user-cell">
              <img src="${s.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + s.name}" class="avatar-sm" alt="${s.name}">
              <div>
                <div class="font-semibold text-white">${s.name}</div>
                <div class="text-xs text-muted">${s.email}</div>
              </div>
            </div>
          </td>
          <td><span class="badge badge-subtle">${s.rollNo || 'N/A'}</span></td>
          <td><span class="text-sm">${className}</span></td>
          <td>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill ${stats.rate >= 75 ? 'bg-success' : 'bg-warning'}" style="width: ${stats.rate}%"></div>
              <span class="text-xs font-semibold">${stats.rate}%</span>
            </div>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-ghost" onclick="window.SmartApp.openEditStudentModal('${s.id}')" title="Edit Student">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="btn btn-sm btn-ghost text-danger" onclick="window.SmartApp.confirmDeleteStudent('${s.id}')" title="Delete Student">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderAdminClassesTable() {
    const container = document.getElementById('admin-classes-list');
    if (!container) return;

    const classes = window.SmartStore.getClasses();
    const students = window.SmartStore.getStudents();

    if (classes.length === 0) {
      container.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-muted">No classes created yet.</td></tr>`;
      return;
    }

    container.innerHTML = classes.map(c => {
      const studentCount = students.filter(s => s.classId === c.id).length;
      return `
        <tr>
          <td><span class="badge badge-primary">${c.code}</span></td>
          <td><div class="font-semibold text-white">${c.name}</div><div class="text-xs text-muted">${c.room}</div></td>
          <td><span class="text-sm">${c.teacherName || 'Not Assigned'}</span></td>
          <td><span class="text-xs text-muted">${c.schedule}</span></td>
          <td><span class="badge badge-subtle">${studentCount} Students</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-ghost" onclick="window.SmartApp.openEditClassModal('${c.id}')" title="Edit Class">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="btn btn-sm btn-ghost text-danger" onclick="window.SmartApp.confirmDeleteClass('${c.id}')" title="Delete Class">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderAdminRecordsTable() {
    const container = document.getElementById('admin-records-list');
    if (!container) return;

    const records = window.SmartStore.getRecords();
    const classFilter = document.getElementById('admin-records-class-filter')?.value || 'all';

    const filtered = records.filter(r => classFilter === 'all' || r.classId === classFilter);

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-muted">No attendance logs available.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.slice(0, 30).map(r => {
      const d = new Date(r.timestamp);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const statusClass = r.status === 'Present' ? 'badge-success' : (r.status === 'Late' ? 'badge-warning' : 'badge-danger');

      return `
        <tr>
          <td><span class="text-xs text-muted font-mono">${r.id.slice(-6)}</span></td>
          <td><div class="font-semibold text-white">${r.studentName}</div><div class="text-xs text-muted">${r.rollNo}</div></td>
          <td><span class="badge badge-subtle">${r.classCode || r.className}</span></td>
          <td><span class="text-sm">${dateStr}</span></td>
          <td><span class="text-xs font-mono text-muted">${timeStr}</span></td>
          <td><span class="badge ${statusClass}">${r.status}</span></td>
          <td><span class="text-xs text-muted">${r.method}</span></td>
        </tr>
      `;
    }).join('');
  }

  bindAdminEvents() {
    // Add Student Button
    const btnAddStudent = document.getElementById('btn-add-student');
    if (btnAddStudent) {
      btnAddStudent.addEventListener('click', () => {
        this.openAddStudentModal();
      });
    }

    // Save Student Form
    const studentForm = document.getElementById('form-student');
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('student-modal-id').value;
        const name = document.getElementById('student-modal-name').value;
        const rollNo = document.getElementById('student-modal-roll').value;
        const email = document.getElementById('student-modal-email').value;
        const classId = document.getElementById('student-modal-class').value;

        if (id) {
          window.SmartStore.updateStudent(id, { name, rollNo, email, classId });
          this.showToast('Student profile updated.', 'success');
        } else {
          window.SmartStore.addStudent({ name, rollNo, email, classId });
          this.showToast('New student added successfully.', 'success');
        }
        this.closeModal('modal-student');
      });
    }

    // Add Class Button
    const btnAddClass = document.getElementById('btn-add-class');
    if (btnAddClass) {
      btnAddClass.addEventListener('click', () => {
        this.openAddClassModal();
      });
    }

    // Save Class Form
    const classForm = document.getElementById('form-class');
    if (classForm) {
      classForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('class-modal-id').value;
        const code = document.getElementById('class-modal-code').value;
        const name = document.getElementById('class-modal-name').value;
        const teacherId = document.getElementById('class-modal-teacher').value;
        const room = document.getElementById('class-modal-room').value;
        const schedule = document.getElementById('class-modal-schedule').value;

        if (id) {
          window.SmartStore.updateClass(id, { code, name, teacherId, room, schedule });
          this.showToast('Class details updated.', 'success');
        } else {
          window.SmartStore.addClass({ code, name, teacherId, room, schedule });
          this.showToast('New class created successfully.', 'success');
        }
        this.closeModal('modal-class');
      });
    }

    // Filter handlers
    ['admin-student-search', 'admin-student-class-filter'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.renderAdminStudentsTable());
      document.getElementById(id)?.addEventListener('change', () => this.renderAdminStudentsTable());
    });

    document.getElementById('admin-records-class-filter')?.addEventListener('change', () => this.renderAdminRecordsTable());
  }

  openAddStudentModal() {
    document.getElementById('student-modal-title').textContent = 'Add New Student';
    document.getElementById('student-modal-id').value = '';
    document.getElementById('student-modal-name').value = '';
    document.getElementById('student-modal-roll').value = '';
    document.getElementById('student-modal-email').value = '';

    this.populateClassDropdown('student-modal-class');
    this.openModal('modal-student');
  }

  openEditStudentModal(studentId) {
    const student = window.SmartStore.getUserById(studentId);
    if (!student) return;

    document.getElementById('student-modal-title').textContent = 'Edit Student';
    document.getElementById('student-modal-id').value = student.id;
    document.getElementById('student-modal-name').value = student.name;
    document.getElementById('student-modal-roll').value = student.rollNo || '';
    document.getElementById('student-modal-email').value = student.email || '';

    this.populateClassDropdown('student-modal-class', student.classId);
    this.openModal('modal-student');
  }

  confirmDeleteStudent(studentId) {
    const student = window.SmartStore.getUserById(studentId);
    if (!student) return;
    if (confirm(`Are you sure you want to remove student "${student.name}"?`)) {
      window.SmartStore.deleteStudent(studentId);
      this.showToast('Student deleted.', 'info');
    }
  }

  openAddClassModal() {
    document.getElementById('class-modal-title').textContent = 'Create New Class';
    document.getElementById('class-modal-id').value = '';
    document.getElementById('class-modal-code').value = '';
    document.getElementById('class-modal-name').value = '';
    document.getElementById('class-modal-room').value = '';
    document.getElementById('class-modal-schedule').value = '';

    this.populateTeacherDropdown('class-modal-teacher');
    this.openModal('modal-class');
  }

  openEditClassModal(classId) {
    const cls = window.SmartStore.getClassById(classId);
    if (!cls) return;

    document.getElementById('class-modal-title').textContent = 'Edit Class';
    document.getElementById('class-modal-id').value = cls.id;
    document.getElementById('class-modal-code').value = cls.code;
    document.getElementById('class-modal-name').value = cls.name;
    document.getElementById('class-modal-room').value = cls.room || '';
    document.getElementById('class-modal-schedule').value = cls.schedule || '';

    this.populateTeacherDropdown('class-modal-teacher', cls.teacherId);
    this.openModal('modal-class');
  }

  confirmDeleteClass(classId) {
    const cls = window.SmartStore.getClassById(classId);
    if (!cls) return;
    if (confirm(`Are you sure you want to delete class "${cls.name}"?`)) {
      window.SmartStore.deleteClass(classId);
      this.showToast('Class deleted.', 'info');
    }
  }

  populateClassDropdown(selectId, selectedId = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const classes = window.SmartStore.getClasses();
    select.innerHTML = classes.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.code} - ${c.name}</option>`).join('');
  }

  populateTeacherDropdown(selectId, selectedId = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const teachers = window.SmartStore.getTeachers();
    select.innerHTML = teachers.map(t => `<option value="${t.id}" ${t.id === selectedId ? 'selected' : ''}>${t.name} (${t.department})</option>`).join('');
  }

  // ==========================================
  // TEACHER DASHBOARD
  // ==========================================
  renderTeacherView() {
    const user = window.SmartAuth.getCurrentUser();
    if (!user) return;

    // Teacher Classes
    this.renderTeacherClasses(user.id);

    // Active Session Box
    this.renderTeacherActiveSession(user.id);

    // Teacher History & Reports
    this.renderTeacherReports(user.id);
  }

  renderTeacherClasses(teacherId) {
    const container = document.getElementById('teacher-classes-cards');
    if (!container) return;

    const classes = window.SmartStore.getClasses().filter(c => c.teacherId === teacherId);
    const allStudents = window.SmartStore.getStudents();

    if (classes.length === 0) {
      container.innerHTML = `<div class="empty-state">No classes assigned yet. Contact your administrator.</div>`;
      return;
    }

    container.innerHTML = classes.map(c => {
      const studentCount = allStudents.filter(s => s.classId === c.id).length;
      return `
        <div class="card class-card">
          <div class="flex items-center justify-between mb-3">
            <span class="badge badge-primary font-mono">${c.code}</span>
            <span class="text-xs text-muted">${c.room}</span>
          </div>
          <h3 class="card-title text-base mb-1">${c.name}</h3>
          <p class="text-xs text-muted mb-4">${c.schedule}</p>
          <div class="flex items-center justify-between border-t border-slate-700/60 pt-3">
            <span class="text-xs text-slate-400">${studentCount} Enrolled</span>
            <button class="btn btn-sm btn-primary" onclick="window.SmartApp.openStartSessionModal('${c.id}')">
              Start Session
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderTeacherActiveSession(teacherId) {
    const panel = document.getElementById('teacher-active-session-panel');
    const noSessionPrompt = document.getElementById('teacher-no-session-prompt');
    if (!panel || !noSessionPrompt) return;

    const activeSession = window.SmartStore.getActiveSessionForTeacher(teacherId);

    if (!activeSession) {
      panel.classList.add('hidden');
      noSessionPrompt.classList.remove('hidden');
      window.SmartQR.stopTimer();
      return;
    }

    noSessionPrompt.classList.add('hidden');
    panel.classList.remove('hidden');

    // Populate session info
    document.getElementById('teacher-sess-class').textContent = `${activeSession.classCode} - ${activeSession.className}`;
    document.getElementById('teacher-sess-topic').textContent = activeSession.topic;
    document.getElementById('teacher-sess-token').textContent = activeSession.token;

    // Render QR Code
    const qrContainer = document.getElementById('teacher-qr-box');
    window.SmartQR.renderQR(qrContainer, activeSession, 220);

    // Live countdown timer
    const timerEl = document.getElementById('teacher-sess-timer');
    window.SmartQR.startTimer(activeSession.expiresAt, timerEl, () => {
      this.showToast('Attendance session has expired.', 'warning');
      this.renderTeacherView();
    });

    // Render live check-in students
    this.renderLiveCheckInList(activeSession.id);
  }

  renderLiveCheckInList(sessionId) {
    const listEl = document.getElementById('teacher-live-attendance-list');
    const countEl = document.getElementById('teacher-live-count');
    if (!listEl) return;

    const records = window.SmartStore.getRecordsForSession(sessionId);
    if (countEl) countEl.textContent = records.length;

    if (records.length === 0) {
      listEl.innerHTML = `<div class="empty-state py-4 text-xs">Waiting for students to scan the QR code...</div>`;
      return;
    }

    listEl.innerHTML = records.map(r => {
      const timeStr = new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `
        <div class="live-checkin-item">
          <div class="flex items-center gap-2">
            <span class="status-dot"></span>
            <div>
              <div class="font-semibold text-xs text-white">${r.studentName}</div>
              <div class="text-[10px] text-muted">${r.rollNo}</div>
            </div>
          </div>
          <div class="text-right">
            <span class="badge ${r.status === 'Present' ? 'badge-success' : 'badge-warning'} text-[10px]">${r.status}</span>
            <div class="text-[10px] font-mono text-muted">${timeStr}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderTeacherReports(teacherId) {
    const container = document.getElementById('teacher-reports-list');
    if (!container) return;

    const teacherClasses = window.SmartStore.getClasses().filter(c => c.teacherId === teacherId);
    const classIds = teacherClasses.map(c => c.id);

    const allRecords = window.SmartStore.getRecords();
    const records = allRecords.filter(r => classIds.includes(r.classId));

    if (records.length === 0) {
      container.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-muted">No attendance sessions completed yet.</td></tr>`;
      return;
    }

    container.innerHTML = records.slice(0, 30).map(r => {
      const d = new Date(r.timestamp);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const statusClass = r.status === 'Present' ? 'badge-success' : (r.status === 'Late' ? 'badge-warning' : 'badge-danger');

      return `
        <tr>
          <td><div class="font-semibold text-white">${r.studentName}</div><div class="text-xs text-muted">${r.rollNo}</div></td>
          <td><span class="badge badge-subtle">${r.classCode || r.className}</span></td>
          <td><span class="text-sm">${dateStr}</span></td>
          <td><span class="text-xs font-mono text-muted">${timeStr}</span></td>
          <td><span class="badge ${statusClass}">${r.status}</span></td>
          <td><span class="text-xs text-muted">${r.method}</span></td>
        </tr>
      `;
    }).join('');
  }

  bindTeacherEvents() {
    // Start session form
    const formSession = document.getElementById('form-start-session');
    if (formSession) {
      formSession.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = window.SmartAuth.getCurrentUser();
        const classId = document.getElementById('session-modal-class').value;
        const topic = document.getElementById('session-modal-topic').value;
        const duration = parseInt(document.getElementById('session-modal-duration').value, 10) || 15;

        try {
          const session = window.SmartStore.createSession({
            classId,
            topic,
            durationMinutes: duration,
            teacherId: user.id
          });
          this.showToast(`Session started for ${session.className}!`, 'success');
          this.closeModal('modal-start-session');
          this.renderTeacherView();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    // End active session button
    const btnEndSession = document.getElementById('btn-end-session');
    if (btnEndSession) {
      btnEndSession.addEventListener('click', () => {
        const user = window.SmartAuth.getCurrentUser();
        const session = window.SmartStore.getActiveSessionForTeacher(user.id);
        if (session && confirm('Are you sure you want to end this attendance session now? Students will no longer be able to scan.')) {
          window.SmartStore.endSession(session.id);
          this.showToast('Attendance session has been closed.', 'info');
          this.renderTeacherView();
        }
      });
    }

    // Download QR
    const btnDownloadQR = document.getElementById('btn-download-qr');
    if (btnDownloadQR) {
      btnDownloadQR.addEventListener('click', () => {
        const qrContainer = document.getElementById('teacher-qr-box');
        window.SmartQR.downloadQR(qrContainer, `attendance-qr-${Date.now()}.png`);
      });
    }

    // Fullscreen / Projector Modal
    const btnProjector = document.getElementById('btn-projector-mode');
    if (btnProjector) {
      btnProjector.addEventListener('click', () => {
        const user = window.SmartAuth.getCurrentUser();
        const session = window.SmartStore.getActiveSessionForTeacher(user.id);
        if (!session) return;

        document.getElementById('projector-class-name').textContent = `${session.classCode} - ${session.className}`;
        document.getElementById('projector-topic').textContent = session.topic;
        document.getElementById('projector-token').textContent = session.token;

        const projContainer = document.getElementById('projector-qr-box');
        window.SmartQR.renderQR(projContainer, session, 380);

        const projTimer = document.getElementById('projector-timer');
        window.SmartQR.startTimer(session.expiresAt, projTimer);

        this.openModal('modal-projector');
      });
    }

    // Manual Student Override
    const btnManualOverride = document.getElementById('btn-manual-override');
    if (btnManualOverride) {
      btnManualOverride.addEventListener('click', () => {
        const user = window.SmartAuth.getCurrentUser();
        const session = window.SmartStore.getActiveSessionForTeacher(user.id);
        if (!session) {
          this.showToast('Please start an active session first.', 'warning');
          return;
        }
        this.openManualOverrideModal(session);
      });
    }

    const formManual = document.getElementById('form-manual-override');
    if (formManual) {
      formManual.addEventListener('submit', (e) => {
        e.preventDefault();
        const sessionId = document.getElementById('manual-modal-session-id').value;
        const studentId = document.getElementById('manual-modal-student').value;
        const status = document.getElementById('manual-modal-status').value;

        try {
          window.SmartStore.manualMarkAttendance({ sessionId, studentId, status });
          this.showToast('Student attendance marked manually.', 'success');
          this.closeModal('modal-manual-override');
          this.renderTeacherView();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }
  }

  openStartSessionModal(preselectedClassId = '') {
    const user = window.SmartAuth.getCurrentUser();
    const select = document.getElementById('session-modal-class');
    if (select) {
      const classes = window.SmartStore.getClasses().filter(c => c.teacherId === user.id);
      if (classes.length === 0) {
        this.showToast('No classes assigned to you.', 'warning');
        return;
      }
      select.innerHTML = classes.map(c => `<option value="${c.id}" ${c.id === preselectedClassId ? 'selected' : ''}>${c.code} - ${c.name}</option>`).join('');
    }
    document.getElementById('session-modal-topic').value = 'Lecture ' + new Date().toLocaleDateString();
    this.openModal('modal-start-session');
  }

  openManualOverrideModal(session) {
    document.getElementById('manual-modal-session-id').value = session.id;
    document.getElementById('manual-modal-session-title').textContent = `${session.classCode} - ${session.topic}`;

    // Populate students enrolled in this class or all students
    const select = document.getElementById('manual-modal-student');
    const students = window.SmartStore.getStudents();
    select.innerHTML = students.map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('');

    this.openModal('modal-manual-override');
  }

  // ==========================================
  // STUDENT DASHBOARD
  // ==========================================
  renderStudentView() {
    const user = window.SmartAuth.getCurrentUser();
    if (!user) return;

    // Student profile header card
    const nameEl = document.getElementById('student-profile-name');
    const rollEl = document.getElementById('student-profile-roll');
    const classEl = document.getElementById('student-profile-class');

    if (nameEl) nameEl.textContent = user.name;
    if (rollEl) rollEl.textContent = user.rollNo || 'N/A';

    const cls = window.SmartStore.getClassById(user.classId);
    if (classEl) classEl.textContent = cls ? `${cls.code} - ${cls.name}` : 'Computer Science Dept';

    // Student stats
    const stats = window.SmartStore.getStudentStats(user.id);
    const rateEl = document.getElementById('student-stat-rate');
    const attendedEl = document.getElementById('student-stat-attended');
    const badgeEl = document.getElementById('student-stat-badge');

    if (rateEl) rateEl.textContent = stats.rate + '%';
    if (attendedEl) attendedEl.textContent = `${stats.attended} / ${stats.total}`;

    if (badgeEl) {
      if (stats.rate >= 75) {
        badgeEl.textContent = 'Eligible for Exams';
        badgeEl.className = 'badge badge-success';
      } else {
        badgeEl.textContent = 'Low Attendance Warning (< 75%)';
        badgeEl.className = 'badge badge-danger';
      }
    }

    // Active session alert for student
    const activeNotice = document.getElementById('student-active-session-notice');
    const activeSessions = window.SmartStore.getActiveSessions();
    if (activeNotice) {
      if (activeSessions.length > 0) {
        const sess = activeSessions[0];
        const alreadyAttended = window.SmartStore.hasStudentAttended(sess.id, user.id);
        activeNotice.classList.remove('hidden');
        activeNotice.innerHTML = `
          <div class="alert-box ${alreadyAttended ? 'alert-info' : 'alert-success'} flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="live-beacon"></span>
              <div>
                <div class="font-bold text-sm text-white">Active Session in Progress: ${sess.className}</div>
                <div class="text-xs text-slate-300">Topic: ${sess.topic} (Token: <code class="font-mono text-amber-300">${sess.token}</code>)</div>
              </div>
            </div>
            ${alreadyAttended
              ? `<span class="badge badge-success">Already Checked-In</span>`
              : `<button class="btn btn-sm btn-primary" onclick="window.SmartApp.triggerQuickScanForSession('${sess.id}')">Quick Check-in</button>`
            }
          </div>
        `;
      } else {
        activeNotice.classList.add('hidden');
      }
    }

    // Personal Attendance Log Table
    this.renderStudentHistoryTable(user.id);
  }

  renderStudentHistoryTable(studentId) {
    const container = document.getElementById('student-records-list');
    if (!container) return;

    const records = window.SmartStore.getRecordsForStudent(studentId);

    if (records.length === 0) {
      container.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-muted">No attendance records found yet. Scan a session QR code above!</td></tr>`;
      return;
    }

    container.innerHTML = records.map(r => {
      const d = new Date(r.timestamp);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const statusClass = r.status === 'Present' ? 'badge-success' : (r.status === 'Late' ? 'badge-warning' : 'badge-danger');

      return `
        <tr>
          <td><span class="badge badge-subtle">${r.classCode || r.className}</span></td>
          <td><span class="text-sm font-medium text-white">${dateStr}</span></td>
          <td><span class="text-xs font-mono text-muted">${timeStr}</span></td>
          <td><span class="badge ${statusClass}">${r.status}</span></td>
          <td><span class="text-xs text-muted">${r.method}</span></td>
          <td>
            <span class="text-success inline-flex items-center gap-1 text-xs font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Verified
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  bindStudentEvents() {
    // Open Camera Button
    const btnStartCamera = document.getElementById('btn-start-camera');
    if (btnStartCamera) {
      btnStartCamera.addEventListener('click', async () => {
        try {
          const scannerFrame = document.getElementById('camera-scanner-frame');
          scannerFrame.classList.remove('hidden');
          btnStartCamera.classList.add('hidden');
          document.getElementById('btn-stop-camera')?.classList.remove('hidden');

          await window.SmartScanner.startCamera('qr-camera-reader', (decodedText) => {
            this.handleScanResult(decodedText, 'QR Camera');
          });
        } catch (err) {
          this.showToast(err.message, 'error');
          document.getElementById('camera-scanner-frame')?.classList.add('hidden');
          btnStartCamera.classList.remove('hidden');
          document.getElementById('btn-stop-camera')?.classList.add('hidden');
        }
      });
    }

    // Stop Camera Button
    const btnStopCamera = document.getElementById('btn-stop-camera');
    if (btnStopCamera) {
      btnStopCamera.addEventListener('click', async () => {
        await window.SmartScanner.stopCamera();
        document.getElementById('camera-scanner-frame')?.classList.add('hidden');
        document.getElementById('btn-start-camera')?.classList.remove('hidden');
        btnStopCamera.classList.add('hidden');
      });
    }

    // File Upload QR Scan
    const fileInput = document.getElementById('qr-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          this.showToast('Analyzing QR image...', 'info');
          const decodedText = await window.SmartScanner.scanFile(file);
          this.handleScanResult(decodedText, 'QR Image');
        } catch (err) {
          this.showToast(err.message, 'error');
        } finally {
          fileInput.value = '';
        }
      });
    }

    // Manual Token Form
    const manualTokenForm = document.getElementById('form-manual-token');
    if (manualTokenForm) {
      manualTokenForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('manual-token-input');
        const token = tokenInput.value.trim();
        if (!token) return;

        try {
          this.handleScanResult(token, 'Manual Code');
          tokenInput.value = '';
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    // Quick Demo Scan (one-click test)
    const btnQuickDemoScan = document.getElementById('btn-quick-demo-scan');
    if (btnQuickDemoScan) {
      btnQuickDemoScan.addEventListener('click', () => {
        const activeSessions = window.SmartStore.getActiveSessions();
        if (activeSessions.length === 0) {
          this.showToast('No active attendance sessions currently running. Please log in as Teacher to start one.', 'warning');
          return;
        }
        const session = activeSessions[0];
        this.triggerQuickScanForSession(session.id);
      });
    }
  }

  triggerQuickScanForSession(sessionId) {
    const session = window.SmartStore.getSessionById(sessionId);
    if (!session) return;
    window.SmartScanner.playSuccessSound();
    this.handleScanResult(session.token, 'QR Demo Scan');
  }

  handleScanResult(rawScanData, method = 'QR Camera') {
    const user = window.SmartAuth.getCurrentUser();
    if (!user || user.role !== 'student') {
      this.showToast('Only enrolled students can record attendance.', 'warning');
      return;
    }

    try {
      const parsed = window.SmartScanner.parseScannedData(rawScanData);
      const record = window.SmartStore.recordAttendance({
        sessionId: parsed.sessionId,
        studentId: user.id,
        method
      });

      this.showAttendanceSuccessModal(record);
      this.showToast(`Attendance marked for ${record.className}!`, 'success');

      // Stop camera after successful scan
      window.SmartScanner.stopCamera();
      document.getElementById('camera-scanner-frame')?.classList.add('hidden');
      document.getElementById('btn-start-camera')?.classList.remove('hidden');
      document.getElementById('btn-stop-camera')?.classList.add('hidden');

      this.renderStudentView();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  showAttendanceSuccessModal(record) {
    const d = new Date(record.timestamp);
    document.getElementById('success-modal-class').textContent = `${record.classCode} - ${record.className}`;
    document.getElementById('success-modal-time').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('success-modal-date').textContent = d.toLocaleDateString();
    document.getElementById('success-modal-student').textContent = `${record.studentName} (${record.rollNo})`;

    this.openModal('modal-scan-success');
  }

  // ==========================================
  // CSV EXPORT ENGINE
  // ==========================================
  handleExportCSV(exportType) {
    let records = [];
    let filename = `SmartAttend_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    const user = window.SmartAuth.getCurrentUser();

    if (exportType === 'admin') {
      records = window.SmartStore.getRecords();
      filename = `SmartAttend_Master_Attendance_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (exportType === 'teacher') {
      const teacherClasses = window.SmartStore.getClasses().filter(c => c.teacherId === user.id).map(c => c.id);
      records = window.SmartStore.getRecords().filter(r => teacherClasses.includes(r.classId));
      filename = `SmartAttend_Teacher_Attendance_${user.username}_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (exportType === 'student') {
      records = window.SmartStore.getRecordsForStudent(user.id);
      filename = `SmartAttend_Student_${user.rollNo || user.username}_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    if (records.length === 0) {
      this.showToast('No attendance records available to export.', 'warning');
      return;
    }

    const csvContent = this.generateCSV(records);
    this.downloadCSVFile(csvContent, filename);
    this.showToast(`CSV Report downloaded (${records.length} records).`, 'success');
  }

  generateCSV(records) {
    const headers = ['Record ID', 'Student Name', 'Roll Number', 'Class Code', 'Class Name', 'Date', 'Time', 'Status', 'Verification Method'];

    const rows = records.map(r => {
      const d = new Date(r.timestamp);
      const dateStr = d.toISOString().slice(0, 10);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      return [
        r.id,
        `"${(r.studentName || '').replace(/"/g, '""')}"`,
        `"${(r.rollNo || '').replace(/"/g, '""')}"`,
        `"${(r.classCode || '').replace(/"/g, '""')}"`,
        `"${(r.className || '').replace(/"/g, '""')}"`,
        dateStr,
        timeStr,
        r.status,
        `"${(r.method || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    // Prepend UTF-8 BOM so Excel opens with proper character encoding
    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }

  downloadCSVFile(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ==========================================
  // MODAL & TOAST HELPERS
  // ==========================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade-in`;

    const iconMap = {
      success: `<svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      error: `<svg class="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    toast.innerHTML = `
      <div class="flex items-center gap-3">
        ${iconMap[type] || iconMap.info}
        <span class="text-sm font-medium text-slate-100">${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}
