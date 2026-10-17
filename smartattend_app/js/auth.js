/**
 * SmartAttend Authentication & Session Module
 * Supports Admin, Teacher, and Student roles with instant demo credentials.
 */

class AuthService {
  constructor() {
    this.sessionKey = 'smartattend_current_user';
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  login(name, rollNo, password) {
    if (!rollNo || !password) {
      throw new Error('Please enter Roll Number / ID and Password.');
    }

    const cleanRoll = rollNo.trim().toLowerCase();
    const cleanName = (name || '').trim().toLowerCase();

    const users = window.SmartStore ? window.SmartStore.getUsers() : [];
    const user = users.find(u => {
      const matchRoll = (u.rollNo && u.rollNo.toLowerCase() === cleanRoll) ||
                        (u.studentId && u.studentId.toLowerCase() === cleanRoll) ||
                        (u.username && u.username.toLowerCase() === cleanRoll) ||
                        (u.email && u.email.toLowerCase() === cleanRoll);
      const matchName = cleanName && u.name ? u.name.toLowerCase() === cleanName : false;
      return matchRoll && (cleanName ? matchName : true);
    }) || users.find(u => {
      return (u.rollNo && u.rollNo.toLowerCase() === cleanRoll) ||
             (u.studentId && u.studentId.toLowerCase() === cleanRoll) ||
             (u.username && u.username.toLowerCase() === cleanRoll) ||
             (u.email && u.email.toLowerCase() === cleanRoll);
    });

    if (!user) {
      throw new Error(`Account not found for "${rollNo}". Please check your credentials.`);
    }

    if (user.password && user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    this.setCurrentUser(user);
    return user;
  }

  quickLogin(role) {
    let targetUsername = 'admin';
    if (role === 'teacher') targetUsername = 'sarah';
    if (role === 'student') targetUsername = 'alex';

    const user = window.SmartStore.getUserByUsername(targetUsername);
    if (!user) {
      throw new Error(`Demo user for role "${role}" not found. Try resetting demo data.`);
    }

    this.setCurrentUser(user);
    return user;
  }

  setCurrentUser(user) {
    // Strip sensitive fields
    const sessionData = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      department: user.department,
      rollNo: user.rollNo,
      classId: user.classId,
      avatar: user.avatar
    };

    this.currentUser = sessionData;
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    window.dispatchEvent(new CustomEvent('smartattend-auth-change', { detail: { user: sessionData } }));
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    window.dispatchEvent(new CustomEvent('smartattend-auth-change', { detail: { user: null } }));
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }
}

// Global instance
window.SmartAuth = new AuthService();
