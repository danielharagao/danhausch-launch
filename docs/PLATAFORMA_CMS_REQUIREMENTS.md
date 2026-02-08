# Requirements Document: BA Pro Learning Platform (CMS)
**Version:** 1.0 (2026-02-08)
**Status:** Draft - Business Analysis Standard
**Methodology:** BABOK® Framework (Epics, Stories, Acceptance Criteria)
**Prioritization:** MoSCoW

---

## 🎯 Executive Summary
The BA Pro Learning Platform is a high-performance CMS designed for "Strategic Decision Architects". The focus is on **Deep Work**, **Clarity**, and **Technical Authority**. It moves away from standard LMS layouts to a "Decision Center" interface.

---

## 🏛️ Epics and User Stories

### EP01: Deep Work Experience (The Interface)
**Priority:** MUST HAVE
Focus: Eliminating distractions and fostering total immersion in the content.

*   **US01.01: Zen Mode**
    *   **As a** student, **I want** to toggle a "Zen Mode" **so that** all UI elements except the video player and immediate navigation are hidden.
    *   **Acceptance Criteria:**
        *   Single toggle button clearly visible.
        *   Transition must be smooth (CSS transition).
        *   Saves preference per user session.
*   **US01.02: Cinema Mode**
    *   **As a** student, **I want** a "Cinema Mode" **so that** the background darkens and the video scales to maximum width.
    *   **Acceptance Criteria:**
        *   Matches prototype `2026-02-05-10-45-ba-top-1-cinema-mode.png`.
        *   Auto-hides cursor after 3 seconds of inactivity.

### EP02: Resources & Knowledge Management (The Vault)
**Priority:** MUST HAVE
Focus: Technical respaldo and immediate access to tools (BABOK tools, templates).

*   **US02.01: Resources Tray**
    *   **As a** student, **I want** a slide-out tray while watching videos **so that** I can download templates without leaving the lesson.
    *   **Acceptance Criteria:**
        *   Matches prototype `2026-02-05-11-35-ba-top-1-player-with-tray.png`.
        *   Supports PDF, XLSX, and Markdown file formats.
*   **US02.02: The Resources Vault**
    *   **As a** student, **I want** a centralized "Vault" page **so that** I can search for any framework or document across the whole course.
    *   **Acceptance Criteria:**
        *   Matches prototype `2026-02-05-12-30-ba-top-1-resources-vault.png`.
        *   Global search functionality (Title and Tags).

### EP03: Learning Path Visualization (The Journey)
**Priority:** SHOULD HAVE
Focus: Reducing the "imposter syndrome" by showing tangible technical progress.

*   **US03.01: Interactive Journey Map**
    *   **As a** student, **I want** to see my progress mapped against the BABOK areas **so that** I feel my technical authority growing.
    *   **Acceptance Criteria:**
        *   Matches prototype `2026-02-05-11-05-ba-top-1-journey-map.png`.
        *   Visual indicators for "In Progress", "Completed", and "Locked".

### EP04: Stakeholder Engagement & Feedback
**Priority:** COULD HAVE
Focus: Community and direct interaction with the mentor.

*   **US04.01: Decision Q&A**
    *   **As a** student, **I want** to drop questions tied to specific timestamps in the video **so that** I get contextual feedback.
    *   **Acceptance Criteria:**
        *   Comment section allows "Link to Timestamp".
        *   Notifications for the mentor when a high-priority technical question is asked.

---

## 📊 MoSCoW Prioritization Summary

| Category | Item | Rationale |
| :--- | :--- | :--- |
| **Must Have** | Zen Mode, Cinema Mode, Resources Tray | Critical for the "Elite" brand positioning. |
| **Must Have** | Video Hosting & Playback | Core functionality. |
| **Should Have** | Journey Map | High psychological value for students. |
| **Could Have** | Timestamped Q&A | Increases engagement but not critical for launch. |
| **Won't Have** | Mobile App (Native) | PWA/Responsive web is sufficient for v1. |

---

## 🛠️ Technical Constraints
*   **Performance:** Must load video player in < 2 seconds on 4G connections.
*   **Security:** Multi-factor authentication (MFA) for high-value modules.
*   **Compatibility:** Desktop primary focus (90% of use case for BAs).
