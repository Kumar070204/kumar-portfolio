import { ANALYTICS_EVENTS, PortfolioSectionName } from './constants';
import { trackRawEvent } from './mixpanel';

/**
 * Reusable Analytics Event Abstraction Layer with Strongly Typed Payloads.
 * High-level wrapper functions used across the application.
 */

export interface PortfolioViewedProps {
  entry_point?: string;
  [key: string]: unknown;
}

export interface SectionViewedProps {
  section_name: PortfolioSectionName;
  section_id: string;
  [key: string]: unknown;
}

export interface ScrollDepthProps {
  depth_percentage: 25 | 50 | 75 | 100;
  [key: string]: unknown;
}

export interface ProjectOpenedProps {
  project_name: string;
  project_category: string;
  github_url?: string;
  is_flagship?: boolean;
  award?: string | null;
  [key: string]: unknown;
}

export interface GithubClickedProps {
  repository_name: string;
  placement: 'Hero Project' | 'Project Card' | 'Contact Card' | 'Footer';
  destination_url?: string;
  [key: string]: unknown;
}

export interface LinkedinClickedProps {
  placement: 'Contact Card' | 'Footer' | 'Nav';
  destination_url?: string;
  [key: string]: unknown;
}

export interface ContactClickedProps {
  contact_method: 'Email' | 'LinkedIn' | 'GitHub' | 'Hire Me Nav';
  placement: 'Navigation' | 'Contact Section' | 'Footer';
  [key: string]: unknown;
}

export interface EmailClickedProps {
  placement: 'Navigation' | 'Contact Card' | 'Footer';
  email_address?: string;
  [key: string]: unknown;
}

export interface NavItemClickedProps {
  nav_item: string;
  target_section: string;
  [key: string]: unknown;
}

/**
 * Track initial Portfolio Landing View
 */
export function trackPortfolioViewed(props?: PortfolioViewedProps): void {
  trackRawEvent(ANALYTICS_EVENTS.PORTFOLIO_VIEWED, props);
}

/**
 * Track when a portfolio section enters the viewport
 */
export function trackSectionViewed(props: SectionViewedProps): void {
  trackRawEvent(`${props.section_name} Section Viewed`, props);
}

/**
 * Track page scroll depth milestones (25%, 50%, 75%, 100%)
 */
export function trackScrollDepth(props: ScrollDepthProps): void {
  trackRawEvent(ANALYTICS_EVENTS.SCROLL_DEPTH_REACHED, props);
}

/**
 * Track when a project link / GitHub / details are opened
 */
export function trackProjectOpened(props: ProjectOpenedProps): void {
  trackRawEvent(ANALYTICS_EVENTS.PROJECT_OPENED, props);
}

/**
 * Track outbound GitHub profile or repository clicks
 */
export function trackGithubClicked(props: GithubClickedProps): void {
  trackRawEvent(ANALYTICS_EVENTS.GITHUB_CLICKED, props);
}

/**
 * Track outbound LinkedIn profile clicks
 */
export function trackLinkedInClicked(props: LinkedinClickedProps): void {
  trackRawEvent(ANALYTICS_EVENTS.LINKEDIN_CLICKED, props);
}

/**
 * Track high-value contact interactions
 */
export function trackContactClicked(props: ContactClickedProps): void {
  trackRawEvent(ANALYTICS_EVENTS.CONTACT_CLICKED, props);
}

/**
 * Track email CTA clicks
 */
export function trackEmailClicked(props: EmailClickedProps): void {
  trackRawEvent(ANALYTICS_EVENTS.EMAIL_CLICKED, props);
}

/**
 * Track navigation bar menu clicks
 */
export function trackNavItemClicked(props: NavItemClickedProps): void {
  trackRawEvent(ANALYTICS_EVENTS.NAV_ITEM_CLICKED, props);
}
