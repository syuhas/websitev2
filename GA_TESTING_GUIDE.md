# Google Analytics Testing Checklist

## Setup
1. Run `ng serve` to start your development server
2. Open browser console (F12 → Console tab)
3. Navigate to your site at `http://localhost:4200`

## Test Each Feature:

### ✅ Page Views
- Navigate between /home, /projects, /resume
- Check console for: `🔍 GA Page View: { url: "/home", title: undefined }`
- Check GA Real-time → Pages

### ✅ Navigation Tracking
- Click on navigation menu items (HOME, PROJECTS, RESUME)
- Check console for: `🔍 GA Event: navigate { event_category: "Navigation", event_label: "/home", value: 1 }`

### ✅ Project Views
- Go to /projects and click on any project card
- Check console for: `🔍 GA Event: view_project { event_category: "Projects", event_label: "project-id: Project Title", value: 1 }`

### ✅ Project Tab Changes
- On a project detail page, click different tabs
- Check console for: `🔍 GA Event: tab_change { event_category: "Projects", event_label: "project-id - Tab Name", value: 1 }`

### ✅ Resume Downloads
- Go to /resume and click PDF/DOCX download buttons
- Check console for: `🔍 GA Event: download { event_category: "Resume", event_label: "PDF", value: 1 }`

### ✅ Certification Clicks
- On resume page, click AWS certification badges
- Check console for: `🔍 GA Event: click { event_category: "Certifications", event_label: "AWS Cloud Practitioner", value: 1 }`

### ✅ External Links
- Click GitHub, LinkedIn, Email icons in navigation
- Check console for: `🔍 GA Event: click { event_category: "External Links", event_label: "GitHub: https://...", value: 1 }`

### ✅ Image Previews
- On project pages, click images to open previews
- Check console for: `🔍 GA Event: image_preview { event_category: "UI Interaction", event_label: "project-id: /assets/...", value: 1 }`

### ✅ Project GitHub Clicks
- On project detail pages, click the GitHub link
- Check console for: `🔍 GA Event: click { event_category: "External Links", event_label: "Project GitHub: https://...", value: 1 }`

## Real-time GA4 Dashboard
- Open https://analytics.google.com
- Go to Reports → Realtime
- Perform actions on your site
- See them appear in real-time dashboard

## Events to Watch For
- **Pageviews**: Should appear in Real-time → Pages
- **Events**: Should appear in Real-time → Events
- **Custom Events**: Look for your custom event names like "view_project", "download", etc.
