# Kumaraswamy G — Cinematic Developer Portfolio & Product Analytics

An enterprise-grade, high-performance personal portfolio website built with **Next.js 16 (App Router)**, **React 19**, **Three.js**, and fully instrumented with **Mixpanel Product Analytics**.

Designed and engineered to treat a developer portfolio as a real digital product, enabling data-driven insights into visitor engagement, section drop-offs, and call-to-action (CTA) conversions.

---

## 📌 Problem Statement

Traditional portfolio websites function as static digital resumes with zero visibility into visitor behavior. Developers cannot answer key product questions such as:
* How many visitors scroll through to explore featured projects?
* Where do high-intent visitors (recruiters, engineering managers) drop off?
* Which specific projects or GitHub repositories generate the highest interest?
* Which contact CTA converts highest (Direct Email vs LinkedIn vs GitHub)?

---

## 🎯 Business Objective & North Star Metric

* **Business Objective**: Understand visitor behavior across the acquisition-to-conversion funnel and optimize engagement pathways for high-value technical opportunities.
* **North Star Metric**: **High-Intent Conversion Rate (%)** — percentage of unique visitors who click a primary conversion CTA (`Hire Me`, `Email`, `LinkedIn`, or `GitHub repository`).

---

## 📊 Product Analytics Strategy

The portfolio utilizes a vendor-agnostic event instrumentation architecture:
1. **Zero Raw Tracking Calls in UI**: All analytics calls pass through a strongly typed abstraction layer (`lib/analytics/events.ts`).
2. **IntersectionObserver Visibility Tracking**: Section view events (`About`, `Experience`, `Projects`, `Research`, `Skills`, `Contact`) fire only when a section is 30%+ visible, guaranteed maximum **once per session**.
3. **Throttled Scroll Depth Tracking**: Tracks scroll milestones at 25%, 50%, 75%, and 100% using `requestAnimationFrame` for 60fps performance.
4. **Enriched Common Metadata**: Automatically enriches every event with browser, operating system, device type (Desktop vs Mobile vs Tablet), screen resolution, viewport size, and referrer.

---

## 📋 Event Taxonomy

| Event Name | Trigger | Key Payload Properties | Business Question Answered |
| :--- | :--- | :--- | :--- |
| `Portfolio Viewed` | Site initial load | `entry_point`, `device_type`, `browser`, `os` | What is overall traffic volume and device demographic breakdown? |
| `Section Viewed` | Section enters viewport (30%+ threshold, max 1/session) | `section_name`, `section_id` | Where do visitors drop off in the reading funnel? |
| `Scroll Depth Reached` | Scroll reaches 25%, 50%, 75%, 100% | `depth_percentage` (25, 50, 75, 100) | How deeply do visitors consume content before leaving? |
| `Project Opened` | GitHub/details clicked on project card | `project_name`, `project_category`, `is_flagship`, `award` | Which project generates the highest engagement? |
| `GitHub Clicked` | Outbound GitHub repo or profile link clicked | `repository_name`, `placement` | Are visitors inspecting source code repositories? |
| `LinkedIn Clicked` | Outbound LinkedIn profile link clicked | `placement` (`Contact Card`, `Footer`) | Do visitors verify professional experience on LinkedIn? |
| `Contact Clicked` | Contact card or "Hire Me" nav CTA clicked | `contact_method`, `placement` | Which call-to-action converts highest-intent leads? |
| `Email Clicked` | `mailto:` link clicked | `placement`, `email_address` | How many direct email inquiries are initiated? |
| `Navigation Item Clicked` | Header navbar item clicked | `nav_item`, `target_section` | Do visitors use navbar shortcuts or scroll organically? |

---

## 🏗️ Architecture

```
kumar-portfolio/
├── app/
│   ├── components/
│   │   ├── CinematicLayer.tsx     # Three.js 3D bokeh background
│   │   └── VideoIntro.tsx          # Main interactive portfolio interface
│   ├── globals.css                # Global design system & tokens
│   ├── layout.tsx                  # Server Component Root Layout
│   └── page.tsx                    # Prerendered static entry page
├── lib/
│   └── analytics/
│       ├── constants.ts            # Centralized event taxonomy dictionary
│       ├── events.ts               # Strongly typed event abstraction functions
│       ├── mixpanel.ts             # Low-level Mixpanel SDK client & error trap
│       ├── provider.tsx            # Client Component hydration boundary
│       └── useAnalyticsTracker.ts  # IntersectionObserver & scroll depth hook
├── .env.example                    # Template environment variables
└── package.json
```

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
* **UI & Animation**: React 19, Three.js, GSAP
* **Product Analytics**: Mixpanel Browser SDK (`mixpanel-browser`)
* **Styling**: Vanilla CSS Modules & CSS Custom Properties

---

## ⚡ Setup & Local Development

1. **Clone repository**:
   ```bash
   git clone https://github.com/Kumar070204/kumar-portfolio.git
   cd kumar-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Set your Mixpanel project token inside `.env.local`:
   ```env
   NEXT_PUBLIC_MIXPANEL_TOKEN=your_actual_mixpanel_token
   ```

4. **Run local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable Name | Required | Scope | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Yes | Client-side (`NEXT_PUBLIC_`) | Mixpanel Project Token from Project Settings |

---

## 📈 Mixpanel Dashboard Reports

Recommended Mixpanel reports to configure in your dashboard:
1. **Conversion Funnel**: `Portfolio Viewed` ➔ `Projects Section Viewed` ➔ `Project Opened` ➔ `GitHub Clicked` ➔ `Contact Clicked`.
2. **Top Projects Breakdown**: Bar chart of `Project Opened` grouped by `project_name`.
3. **Device Segmentation**: Pie chart of `Portfolio Viewed` segmented by `device_type` (Desktop vs Mobile).
4. **Scroll Depth Retention**: Line chart of `Scroll Depth Reached` by `depth_percentage`.

---

## 🚀 Future Improvements

* **Feature Flags & Cohort Segmentation**: Deliver targeted content variations to returning vs first-time visitors.
* **A/B Testing**: Test alternative Hero CTA headlines to maximize initial scroll conversion.
* **Session Replay Analysis**: Integrate Mixpanel Session Replay for qualitative UI friction detection.

---

## 📄 License

MIT License © 2025 Kumaraswamy G
