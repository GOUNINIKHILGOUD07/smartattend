# SmartAttend — Modern QR Code Attendance & Class Management System

SmartAttend is a modern, responsive web application designed for academic institutions to manage courses, streamline attendance tracking, and eliminate proxy check-ins using dual QR code workflows (Course Joining QR + Dynamic Session Attendance QR).

---

## ✨ Key Features

### 1. Dual Role Authentication & Registration
- **Role Separation**: Dedicated portals for **Students** and **Teachers**.
- **Student Registration**: Name, Student ID / Roll Number, Email, Semester, and Password.
- **Teacher Registration**: Name, Teacher ID, Email, Department, and Password.
- **Persistent Accounts**: Instant authentication and automatic role-based dashboard redirection.

### 2. Teacher Course Management
- **Course Creation & Customization**: Create courses with Course Name, Course Code, Subject, Department, Room, and Schedule.
- **Teacher Course Directory**: Teachers manage only their assigned and created courses.
- **Permanent Course Joining QR Code**: Unique enrollment QR code and manual course code for students to register with a single scan.
- **Real-Time Student Roster**: View all enrolled students per course.

### 3. Dynamic Attendance QR Sessions
- **Session-Specific QR Codes**: Teachers launch attendance sessions with unique session tokens, lecture topics, and configurable timers (5 to 30 min).
- **Projector Mode**: Fullscreen, high-contrast QR display optimized for lecture halls and projectors.
- **Enrollment Validation**: Enforces that only registered students can mark attendance for that course.
- **Anti-Proxy Protection**: Prevents duplicate check-ins for the same student and session.
- **Live Stream**: Instant real-time feed of checked-in students as they scan.

### 4. Student Experience
- **Interactive Student Dashboard**: View overall attendance rate, exam eligibility alerts (≥ 75%), enrolled courses, and verified session logs.
- **Dual Enrollment Modes**: Scan teacher's course QR code using camera viewfinder or enter the course code manually.
- **Pre-Enrollment Course Confirmation**: Displays course details, code, and teacher before confirming enrollment.
- **Attendance Scanner**: Camera-based QR scanner and manual token entry for recording presence in active sessions.

### 5. Attendance Auditing & Analytics
- **Live Records Table**: Filter by course, status (`Present` / `Absent`), and date.
- **CSV Data Export**: One-click download of attendance data reports for teachers and administrators.
- **Course Attendance Progress**: Visual indicators and percentage bars for every course.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite)
- **Styling**: Modular CSS design system with custom variables and modern SaaS aesthetics
- **Icons**: Lucide React
- **QR Engine**: `qrcode` + HTML5 camera scanner
- **State Management**: React Context API with LocalStorage persistence

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/GOUNINIKHILGOUD07/smartattend.git

# Navigate to the project directory
cd smartattend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📂 Project Architecture

```
smartattend/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── context/
│   │   └── AppContext.jsx          # Central state, auth, courses, & attendance logic
│   ├── components/
│   │   ├── common/                 # Reusable buttons, badges, modals, stat cards
│   │   └── layout/                 # Sidebar, Navbar, and Dashboard layouts
│   └── screens/
│       ├── LoginScreen.jsx         # Role-segmented login portal
│       ├── RegisterScreen.jsx      # Student & Teacher registration
│       ├── TeacherDashboard.jsx    # Teacher stats, active sessions, and courses
│       ├── StudentDashboard.jsx    # Student attendance %, classes, and quick actions
│       ├── MyCoursesScreen.jsx     # Course creation & joining QR hub
│       ├── QRCodesHubScreen.jsx    # Dynamic attendance sessions & projector mode
│       ├── StudentJoinCourseScreen.jsx  # Student camera QR scanner & course enrollment
│       ├── StudentScanAttendanceScreen.jsx # Student QR scanner for attendance
│       ├── AttendanceHistoryScreen.jsx # Audit records and filtering
│       └── ReportsScreen.jsx       # Analytics and CSV export
└── smartattend_app/                # Preserved institutional assets & baseline
```

---

## 📄 License
This project is licensed under the MIT License.
