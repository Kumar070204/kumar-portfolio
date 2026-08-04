/**
 * Centralized Analytics Constants & Event Taxonomy Dictionary.
 * Prevents typos in event names and property keys across the application.
 */

export const ANALYTICS_EVENTS = {
  PORTFOLIO_VIEWED: 'Portfolio Viewed',
  SECTION_VIEWED: 'Section Viewed',
  SCROLL_DEPTH_REACHED: 'Scroll Depth Reached',
  PROJECT_OPENED: 'Project Opened',
  GITHUB_CLICKED: 'GitHub Clicked',
  LINKEDIN_CLICKED: 'LinkedIn Clicked',
  CONTACT_CLICKED: 'Contact Clicked',
  EMAIL_CLICKED: 'Email Clicked',
  NAV_ITEM_CLICKED: 'Navigation Item Clicked',
  MEDIA_CONTROL_TOGGLED: 'Media Control Toggled',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export const PORTFOLIO_SECTIONS = {
  HERO: 'Hero',
  ABOUT: 'About',
  EXPERIENCE: 'Experience',
  PROJECTS: 'Projects',
  RESEARCH: 'Research',
  SKILLS: 'Skills',
  CONTACT: 'Contact',
} as const;

export type PortfolioSectionName = (typeof PORTFOLIO_SECTIONS)[keyof typeof PORTFOLIO_SECTIONS];
