import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const INITIAL_CLASSES = [];
export const INITIAL_ACCOUNTS = [];
export const INITIAL_ATTENDANCE = [];

// Helper to check and purge legacy fake demo records
const getCleanStorage = (key) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Detect legacy mock data markers
    const hasMock = JSON.stringify(parsed).includes('Evelyn Hayes') ||
                    JSON.stringify(parsed).includes('Sarah Jenkins') ||
                    JSON.stringify(parsed).includes('Alex Mercer') ||
                    JSON.stringify(parsed).includes('CLS-101');
    if (hasMock) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  // Accounts Registry (real user data only)
  const [accounts, setAccounts] = useState(() => {
    return getCleanStorage('smartattend_accounts') || INITIAL_ACCOUNTS;
  });

  // Current Logged In User
  const [currentUser, setCurrentUser] = useState(() => {
    return getCleanStorage('smartattend_current_user') || null;
  });

  // Auth Screen View Mode ('login' or 'register')
  const [authView, setAuthView] = useState('login');

  // Navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Classes Curriculum
  const [classes, setClasses] = useState(() => {
    return getCleanStorage('smartattend_classes') || INITIAL_CLASSES;
  });

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    return getCleanStorage('smartattend_attendance') || INITIAL_ATTENDANCE;
  });

  // Active QR Session
  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('smartattend_active_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt) > new Date()) return parsed;
      } catch (e) {}
    }
    return null;
  });

  // Toast Notification
  const [notification, setNotification] = useState(null);

  // Derive students list from registered accounts
  const students = accounts
    .filter(a => a.role === 'student')
    .map(s => ({
      id: s.id,
      rollNo: s.studentId || s.rollNo || s.id,
      name: s.name,
      email: s.email,
      semester: s.semester || '6th Semester',
      avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`,
      enrolledClassIds: s.enrolledClassIds || []
    }));

  // Derive teachers list from registered accounts
  const teachers = accounts
    .filter(a => a.role === 'teacher')
    .map(t => ({
      id: t.id,
      teacherId: t.teacherId || t.id,
      name: t.name,
      email: t.email,
      department: t.department || 'Computer Science',
      title: t.title || 'Faculty Instructor',
      avatar: t.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}`,
      assignedClassIds: t.assignedClassIds || []
    }));

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('smartattend_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smartattend_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smartattend_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('smartattend_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('smartattend_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('smartattend_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('smartattend_active_session');
    }
  }, [activeSession]);

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. LOGIN FUNCTION (Supports Name, Roll No / Student ID / Email, and Password)
  const login = (param1, param2, param3) => {
    let name = '';
    let rollNo = '';
    let password = '';

    if (typeof param1 === 'object' && param1 !== null) {
      name = param1.name || '';
      rollNo = param1.rollNo || param1.email || param1.studentId || '';
      password = param1.password || '';
    } else {
      rollNo = param1 || '';
      password = param2 || '';
      name = param3 || '';
    }

    const cleanRoll = rollNo.trim().toLowerCase();
    const cleanName = name.trim().toLowerCase();

    if (!cleanRoll && !cleanName) {
      showToast('Validation Error', 'Please enter your Name or Roll Number / Email.', 'error');
      return { success: false, message: 'Please provide your Roll Number or Name.' };
    }

    // Try finding matching registered account
    const account = accounts.find(a => {
      const matchRoll = (a.rollNo && a.rollNo.toLowerCase() === cleanRoll) ||
                        (a.studentId && a.studentId.toLowerCase() === cleanRoll) ||
                        (a.teacherId && a.teacherId.toLowerCase() === cleanRoll) ||
                        (a.email && a.email.toLowerCase() === cleanRoll) ||
                        (a.id && a.id.toLowerCase() === cleanRoll);
      const matchName = cleanName && a.name ? a.name.toLowerCase() === cleanName : false;
      return matchRoll && (cleanName ? matchName : true);
    }) || accounts.find(a => {
      return (a.rollNo && a.rollNo.toLowerCase() === cleanRoll) ||
             (a.studentId && a.studentId.toLowerCase() === cleanRoll) ||
             (a.teacherId && a.teacherId.toLowerCase() === cleanRoll) ||
             (a.email && a.email.toLowerCase() === cleanRoll);
    }) || accounts.find(a => {
      return cleanName && a.name && a.name.toLowerCase() === cleanName;
    });

    if (!account) {
      const hint = rollNo ? `"${rollNo}"` : `"${name}"`;
      showToast('Login Failed', `No registered account found for ${hint}. Please register below.`, 'error');
      return { success: false, message: `No registered account found matching ${hint}. Please register a new account.` };
    }

    if (account.password && account.password !== password) {
      showToast('Invalid Password', 'The password entered is incorrect.', 'error');
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(account);
    setActiveTab('dashboard');
    showToast('Signed In', `Welcome back, ${account.name}! (${account.role.toUpperCase()})`, 'success');
    return { success: true, account };
  };

  // 2. REGISTRATION FUNCTION
  const register = (registrationData) => {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      studentId,
      teacherId,
      department,
      semester,
      classIds
    } = registrationData;

    // Basic Validation
    if (!name || !email || !password || !confirmPassword || !role) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return { success: false, message: 'All fields are required.' };
    }

    if (password.length < 6) {
      showToast('Weak Password', 'Password must be at least 6 characters.', 'error');
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (password !== confirmPassword) {
      showToast('Password Mismatch', 'Password and Confirm Password do not match.', 'error');
      return { success: false, message: 'Passwords do not match.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const duplicate = accounts.some(a => a.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      showToast('Email In Use', 'An account with this email address is already registered.', 'error');
      return { success: false, message: 'This email is already registered. Please sign in.' };
    }

    // Role-specific validation
    if (role === 'student' && !studentId) {
      showToast('Missing Student ID', 'Please provide your Student ID / Roll Number.', 'error');
      return { success: false, message: 'Student ID / Roll Number is required.' };
    }

    if (role === 'teacher' && !teacherId) {
      showToast('Missing Teacher ID', 'Please provide your Faculty / Teacher ID.', 'error');
      return { success: false, message: 'Teacher ID is required.' };
    }

    // Generate unique account ID
    const newId = (role === 'student' ? 'STU-' : role === 'teacher' ? 'TCH-' : 'ADM-') + Date.now();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const newAccount = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: role,
      avatar,
      ...(role === 'student' && {
        studentId: studentId.trim(),
        rollNo: studentId.trim(),
        semester: semester || '1st Semester',
        title: `Student • ${semester || '1st Semester'}`,
        enrolledClassIds: classIds && classIds.length > 0 ? classIds : []
      }),
      ...(role === 'teacher' && {
        teacherId: teacherId.trim(),
        department: department || 'General Studies',
        title: `Faculty • ${department || 'General Studies'}`,
        assignedClassIds: classIds && classIds.length > 0 ? classIds : []
      }),
      ...(role === 'admin' && {
        title: 'Institutional Administrator'
      })
    };

    // Update Accounts List
    setAccounts(prev => [newAccount, ...prev]);

    // Update class rosters if student/teacher selected classes
    if (role === 'student' && classIds && classIds.length > 0) {
      setClasses(prev => prev.map(c => {
        if (classIds.includes(c.id) && !c.enrolledStudentIds?.includes(newAccount.id)) {
          return { ...c, enrolledStudentIds: [...(c.enrolledStudentIds || []), newAccount.id] };
        }
        return c;
      }));
    } else if (role === 'teacher' && classIds && classIds.length > 0) {
      setClasses(prev => prev.map(c => {
        if (classIds.includes(c.id)) {
          return { ...c, teacherId: newAccount.teacherId, teacher: newAccount.name };
        }
        return c;
      }));
    }

    // Auto-login to their registered account!
    setCurrentUser(newAccount);
    setActiveTab('dashboard');
    showToast('Registration Successful', `Account created! Welcome to SmartAttend, ${newAccount.name}.`, 'success');
    return { success: true, account: newAccount };
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthView('login');
    showToast('Signed Out', 'You have been safely signed out.');
  };

  // Session Management
  const startQRSession = (classId, topic, durationMinutes = 15) => {
    const targetClass = classes.find(c => c.id === classId) || classes[0];
    const expires = new Date(Date.now() + durationMinutes * 60 * 1000);
    const token = 'SA-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const newSession = {
      id: 'SES-' + Date.now(),
      classId: targetClass.id,
      classCode: targetClass.code,
      className: targetClass.name,
      teacherId: currentUser?.teacherId || targetClass.teacherId,
      teacherName: currentUser?.name || targetClass.teacher,
      topic: topic || 'Regular Lecture',
      token,
      durationMinutes,
      expiresAt: expires.toISOString(),
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      checkedInStudents: []
    };

    setActiveSession(newSession);
    showToast('Session Started', `Live QR Code active for ${targetClass.code} (${durationMinutes} mins).`, 'success');
    return newSession;
  };

  const stopQRSession = () => {
    setActiveSession(null);
    showToast('Session Concluded', 'Attendance session finalized.');
  };

  // Mark attendance for logged-in student (Requires Enrollment in Course)
  const markAttendance = (sessionToken, targetStudentId, method = 'QR Scan') => {
    if (!activeSession) {
      showToast('Error', 'No active attendance session is open.', 'error');
      return { success: false, reason: 'No active session' };
    }

    if (sessionToken && sessionToken.trim().toUpperCase() !== activeSession.token.toUpperCase()) {
      showToast('Invalid QR Code', 'Session token is invalid or has expired.', 'error');
      return { success: false, reason: 'Invalid token' };
    }

    // Determine actual student
    const stuId = targetStudentId || (currentUser?.role === 'student' ? currentUser.id : students[0]?.id);
    const stuAccount = accounts.find(a => a.id === stuId) || currentUser;

    if (!stuAccount) {
      showToast('Error', 'Student record not found.', 'error');
      return { success: false, reason: 'Student not found' };
    }

    // MANDATORY ENROLLMENT CHECK: Student must be enrolled in this specific course
    const targetClass = classes.find(c => c.id === activeSession.classId);
    const isEnrolled = targetClass && (
      (targetClass.enrolledStudentIds || []).includes(stuAccount.id) ||
      (targetClass.enrolledStudentIds || []).includes(stuAccount.studentId) ||
      (stuAccount.enrolledClassIds || []).includes(activeSession.classId)
    );

    if (!isEnrolled) {
      showToast('Enrollment Required', `You must be enrolled in ${activeSession.classCode} before marking attendance. Please join the course first.`, 'error');
      return { success: false, reason: 'Not enrolled in course', message: `You are not enrolled in ${activeSession.className}. Please join the course first.` };
    }

    // Duplicate Check for the same student and session
    const alreadyPresent = attendanceRecords.some(
      r => (r.studentId === stuAccount.id || r.rollNo === stuAccount.studentId) &&
           r.classId === activeSession.classId &&
           r.date === activeSession.date &&
           r.status === 'Present'
    );

    if (alreadyPresent) {
      showToast('Already Checked In', `${stuAccount.name} is already marked Present for this session.`, 'warning');
      return { success: false, reason: 'Already checked in', message: 'You have already marked attendance for this session.' };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord = {
      id: 'ATT-' + Date.now(),
      sessionId: activeSession.id,
      studentId: stuAccount.id,
      studentName: stuAccount.name,
      rollNo: stuAccount.studentId || stuAccount.rollNo || stuAccount.id,
      classId: activeSession.classId,
      className: activeSession.className,
      courseCode: activeSession.classCode,
      date: activeSession.date,
      time: timeStr,
      status: 'Present',
      method: method
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    setActiveSession(prev => ({
      ...prev,
      checkedInStudents: [
        ...(prev.checkedInStudents || []),
        { id: stuAccount.id, name: stuAccount.name, rollNo: newRecord.rollNo, time: timeStr }
      ]
    }));

    showToast('Attendance Recorded', `Verified: ${stuAccount.name} marked Present!`, 'success');
    return { success: true, record: newRecord };
  };

  // 3. COURSE MANAGEMENT (Create, Update, Delete)
  const createCourse = (courseData) => {
    const teacherId = currentUser?.teacherId || currentUser?.id || 'TCH-' + Date.now().toString().slice(-4);
    const teacherName = currentUser?.name || 'Faculty Instructor';
    const newCourse = {
      id: 'CRS-' + Date.now().toString().slice(-6),
      code: (courseData.code || '').trim().toUpperCase(),
      name: (courseData.name || '').trim(),
      subject: (courseData.subject || '').trim() || 'General Studies',
      description: (courseData.description || '').trim() || 'Curriculum Course Session',
      department: (courseData.department || '').trim() || 'Computer Science',
      schedule: (courseData.schedule || '').trim() || 'Flexible Schedule',
      room: (courseData.room || '').trim() || 'Hall 1',
      teacherId: teacherId,
      teacher: teacherName,
      enrolledStudentIds: []
    };

    setClasses(prev => [newCourse, ...prev]);

    // Also associate to current teacher account
    if (currentUser && currentUser.role === 'teacher') {
      const updatedAssigned = [...(currentUser.assignedClassIds || []), newCourse.id];
      setCurrentUser(prev => ({ ...prev, assignedClassIds: updatedAssigned }));
      setAccounts(prev => prev.map(a => a.id === currentUser.id ? { ...a, assignedClassIds: updatedAssigned } : a));
    }

    showToast('Course Created', `${newCourse.code}: ${newCourse.name} has been published successfully.`);
    return newCourse;
  };

  const updateCourse = (courseId, updatedData) => {
    setClasses(prev => prev.map(c => c.id === courseId ? { ...c, ...updatedData } : c));
    showToast('Course Updated', 'Course details updated successfully.');
  };

  const deleteCourse = (courseId) => {
    setClasses(prev => prev.filter(c => c.id !== courseId));
    // Cleanup active session if it was on this course
    if (activeSession && activeSession.classId === courseId) {
      setActiveSession(null);
    }
    showToast('Course Removed', 'Course has been deleted from curriculum.');
  };

  // 4. STUDENT COURSE JOINING / ENROLLMENT (via QR Scan or Code Entry)
  const joinCourse = (courseCodeOrId, targetStudentId) => {
    if (!courseCodeOrId) {
      showToast('Validation Error', 'Please enter a valid Course Code.', 'error');
      return { success: false, message: 'Please enter a Course Code.' };
    }

    const cleanInput = courseCodeOrId.trim().toUpperCase();
    const course = classes.find(c =>
      c.code.toUpperCase() === cleanInput ||
      c.id.toUpperCase() === cleanInput
    );

    if (!course) {
      showToast('Course Not Found', `No course found with code "${courseCodeOrId}". Please check and try again.`, 'error');
      return { success: false, message: `No course found with code "${courseCodeOrId}".` };
    }

    const stuId = targetStudentId || currentUser?.id;
    const stuAccount = accounts.find(a => a.id === stuId) || currentUser;

    if (!stuAccount) {
      showToast('Authentication Error', 'Student account not found.', 'error');
      return { success: false, message: 'Student account not found.' };
    }

    // Check if already enrolled
    const isAlreadyEnrolled = (course.enrolledStudentIds || []).includes(stuAccount.id) ||
                              (course.enrolledStudentIds || []).includes(stuAccount.studentId) ||
                              (stuAccount.enrolledClassIds || []).includes(course.id);

    if (isAlreadyEnrolled) {
      showToast('Already Enrolled', `You are already enrolled in ${course.code}: ${course.name}.`, 'warning');
      return { success: false, message: `You are already enrolled in ${course.code}: ${course.name}.` };
    }

    // Update course roster
    const updatedCourseRoster = [...(course.enrolledStudentIds || []), stuAccount.id];
    setClasses(prev => prev.map(c => c.id === course.id ? { ...c, enrolledStudentIds: updatedCourseRoster } : c));

    // Update student account enrollment
    const updatedStudentEnrolled = [...(stuAccount.enrolledClassIds || []), course.id];
    setAccounts(prev => prev.map(a => a.id === stuAccount.id ? { ...a, enrolledClassIds: updatedStudentEnrolled } : a));

    if (currentUser?.id === stuAccount.id) {
      setCurrentUser(prev => ({ ...prev, enrolledClassIds: updatedStudentEnrolled }));
    }

    showToast('Enrolled in Course', `Welcome! You successfully joined ${course.code}: ${course.name}.`, 'success');
    return { success: true, course };
  };

  const addClass = createCourse;
  const deleteClass = deleteCourse;
  const deleteStudent = (studentId) => {
    setAccounts(prev => prev.filter(a => a.id !== studentId));
    showToast('Student Removed', 'Student account removed from directory.');
  };

  // CSV Export for filtered records
  const exportAttendanceCSV = (recordsToExport, customFilename) => {
    const rows = recordsToExport || attendanceRecords;
    if (rows.length === 0) {
      showToast('Export Notice', 'No records found to export.', 'warning');
      return;
    }

    const headers = ['Record ID', 'Student ID', 'Student Name', 'Roll Number', 'Course Code', 'Course Title', 'Date', 'Time', 'Status', 'Verification Method'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.id}"`,
        `"${r.studentId}"`,
        `"${r.studentName}"`,
        `"${r.rollNo}"`,
        `"${r.classId}"`,
        `"${(r.className || '').replace(/"/g, '""')}"`,
        `"${r.date}"`,
        `"${r.time}"`,
        `"${r.status}"`,
        `"${r.method}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', customFilename || `SmartAttend_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Downloaded', `Successfully exported ${rows.length} records.`);
  };

  const clearAllData = () => {
    localStorage.clear();
    setAccounts([]);
    setClasses([]);
    setAttendanceRecords([]);
    setActiveSession(null);
    setCurrentUser(null);
    showToast('Data Cleared', 'All application data has been wiped.');
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        currentUser,
        setCurrentUser,
        authView,
        setAuthView,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        classes,
        courses: classes,
        students,
        teachers,
        attendanceRecords,
        activeSession,
        notification,
        showToast,
        login,
        register,
        logout,
        startQRSession,
        stopQRSession,
        markAttendance,
        createCourse,
        updateCourse,
        deleteCourse,
        joinCourse,
        addClass,
        deleteClass,
        deleteStudent,
        exportAttendanceCSV,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
