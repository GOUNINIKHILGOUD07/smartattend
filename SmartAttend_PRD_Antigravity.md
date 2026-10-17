# SmartAttend - QR Code Attendance Management System
## Product Requirements Document (PRD)

---

### 1. Executive Summary
**SmartAttend** is a responsive, web-based QR code attendance tracking application designed for educational institutions, lecture halls, and corporate training. It provides a frictionless workflow for teachers to initiate timed attendance sessions by generating dynamic QR codes, while students can scan the codes using their mobile or laptop cameras to verify their presence within seconds. Administrators maintain full oversight over classes, teachers, student rosters, and aggregate attendance reports with one-click CSV exports.

---

### 2. Architecture & Technical Scope
- **Frontend Core**: Vanilla HTML5, CSS3, Modern JavaScript (ES6+ Modules / Vanilla JS without framework lock-in).
- **Offline / Local Execution**: High-speed, self-contained architecture that requires zero complex backend setup for local testing.
- **Client-Side Persistence**: Browser `localStorage` with initial mock seeding and manual factory reset.
- **QR Code Engine**:
  - Generation: Local bundled `qrcode.min.js`.
  - Detection: Bundled `html5-qrcode.min.js` supporting native camera feeds, rear/front camera switching, and file drag-and-drop fallback.
- **Dual Entry Points**:
  - Root: `/index.html` (root entry point for standard web servers)
  - Subfolder: `/smartattend_app/index.html` (subfolder entry point with robust relative asset paths)

---

### 3. Critical Disclaimer: Frontend-Only Demo vs. Production Security

> [!WARNING]
> **Demo Security Notice**
> This implementation runs entirely on the client side using browser `localStorage` to allow seamless local testing and evaluation without database configuration.
> 
> In a **Production Deployment**, the following backend safeguards MUST be added:
> 1. **Server-Side Authentication**: JWT / HTTP-only secure cookies with bcrypt password hashing.
> 2. **Anti-Proxy / Dynamic QR Codes**: Server-generated short-lived rotating nonces (e.g., refreshed every 5–15 seconds via WebSocket / SSE) so students cannot share photos of the QR code with friends outside the classroom.
> 3. **Geofencing & IP Verification**: Checking student device GPS coordinates against classroom radius or restricting check-ins to campus Wi-Fi / subnet.
> 4. **Device Fingerprinting**: Restricting one student account per physical device per session to prevent one student scanning on behalf of others.

---

### 4. User Roles & Personas

| Role | Default Username | Default Password | Primary Responsibilities |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | System oversight, managing classes & courses, managing student roster, managing teachers, viewing institutional analytics, exporting master CSV reports. |
| **Teacher** | `sarah` | `teacher123` | Generating dynamic attendance QR sessions, viewing live check-ins in real-time, manual student check-in override, class attendance analytics, CSV exports. |
| **Student** | `alex` | `student123` | Scanning session QR codes via camera or image upload, tracking individual attendance percentage, reviewing historical records and warnings. |

---

### 5. Functional Requirements

#### 5.1 Authentication & Role Switching
- Multi-role login screen with intuitive quick-switch demo badges for instant 1-click evaluation.
- Local session state stored in `localStorage` under `smartattend_current_user`.
- Protected dashboard views tailored to active user role.
- Safe logout action clearing active session.

#### 5.2 Admin Dashboard & Roster Management
- **Metrics Dashboard**: Total students, active courses, total recorded check-ins, aggregate attendance rate.
- **Class Management**:
  - Add new class (Class Code, Name, Assigned Teacher, Schedule, Room).
  - Edit or delete existing classes.
- **Student Management**:
  - Add new student (Full Name, Roll Number, Email, Assigned Class).
  - Search and filter students by name, roll number, or class.
  - Delete student records.
- **Data Management**: "Reset Demo Data" option to instantly restore healthy mock data.

#### 5.3 Teacher Dashboard & QR Attendance Sessions
- **Session Creator**:
  - Select class and input session topic (e.g., "Lecture 08: Distributed Systems").
  - Configurable expiration timer (5 min, 10 min, 15 min, 30 min, 60 min).
- **Dynamic QR Code Display**:
  - Generates high-contrast QR code with embedded JSON payload (`sessionId`, `classId`, `topic`, `expiresAt`, `token`).
  - Real-time countdown timer displaying minutes and seconds remaining.
  - Fullscreen / Projector Mode for large classroom displays.
  - Download QR code image as PNG.
- **Live Attendance Roster**:
  - Instant live feed of students who scan in during the active session.
  - Manual check-in override button (mark Present, Late, or Absent).
  - End Session button to close attendance immediately.

#### 5.4 Student Dashboard & QR Scanner
- **Camera QR Scanner**:
  - Requests camera permissions with polite error guidance if denied or unavailable.
  - Video viewfinder with scanner guide overlay and camera selector (front/back).
- **Fallback Verification Options**:
  - **Upload QR Image**: Upload a screenshot or photo of the QR code.
  - **Direct Session Code / Simulation**: Type or paste the session code directly (ideal for headless or restricted browser environments).
- **Validation Rules**:
  - Rejects expired sessions.
  - Rejects non-enrolled students if class-specific restrictions apply.
  - Rejects duplicate scans by the same student for the same session.
- **Student Analytics**:
  - Overall attendance percentage badge (Green $\ge$ 75%, Amber 65–74%, Red < 65%).
  - Chronological log of personal attendance records with date, time, and verification method.

#### 5.5 Attendance History, Reports & CSV Export
- Searchable, filterable table by Class, Date, and Attendance Status (Present / Late / Absent).
- UTF-8 CSV Export engine compatible with Microsoft Excel, Google Sheets, and LibreOffice.
- Export includes: `Record ID, Student Name, Roll Number, Class, Date, Time, Status, Teacher, Method`.

---

### 6. Data Model (`localStorage` Schema)

```json
{
  "smartattend_users": [
    { "id": "u1", "username": "admin", "role": "admin", "name": "System Administrator", "email": "admin@smartattend.edu" },
    { "id": "u2", "username": "sarah", "role": "teacher", "name": "Prof. Sarah Connor", "department": "Computer Science" },
    { "id": "u3", "username": "alex", "role": "student", "name": "Alex Mercer", "rollNo": "CS2026-042", "classId": "cls-1" }
  ],
  "smartattend_classes": [
    { "id": "cls-1", "code": "CS-301", "name": "Cloud Computing", "teacherId": "u2", "room": "Lab 4B", "schedule": "Mon/Wed 10:00 AM" }
  ],
  "smartattend_sessions": [
    { "id": "sess-101", "classId": "cls-1", "topic": "Cloud Native Architecture", "teacherId": "u2", "createdAt": "2026-10-17T10:00:00Z", "expiresAt": "2026-10-17T10:30:00Z", "active": true, "token": "SA-99382" }
  ],
  "smartattend_records": [
    { "id": "rec-1", "sessionId": "sess-101", "studentId": "u3", "studentName": "Alex Mercer", "rollNo": "CS2026-042", "classId": "cls-1", "timestamp": "2026-10-17T10:04:12Z", "status": "Present", "method": "QR Camera" }
  ]
}
```

---

### 7. Verification and Testing Scenarios

1. **Quick-Login Test**:
   - Navigate to login page, click any of the 3 Quick-Login buttons (`Admin`, `Teacher`, `Student`), verify immediate dashboard redirect.
2. **Session Creation & QR Generation Test**:
   - Log in as Teacher (`sarah`). Click **Start Session**. Choose **Cloud Computing**. Set timer to 15m. Click **Generate QR**.
   - Verify QR renders crisply and timer counts down.
3. **Student Scan Test**:
   - Open Student session (or login as `alex` in another tab or private window).
   - Click **Scan QR**. Point camera at teacher screen OR click **Quick Demo Scan** / Upload QR screenshot.
   - Verify green confirmation toast and record appears in student history.
4. **Live Feed Sync Test**:
   - Switch back to Teacher dashboard. Verify Alex Mercer appears immediately in the live check-in list.
5. **CSV Export Test**:
   - From Teacher or Admin dashboard, click **Export to CSV**.
   - Open downloaded CSV file in spreadsheet viewer and verify formatted columns.
