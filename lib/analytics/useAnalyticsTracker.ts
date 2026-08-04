'use client';

import { useEffect, useRef } from 'react';
import { PORTFOLIO_SECTIONS, PortfolioSectionName } from './constants';
import {
  trackPortfolioViewed,
  trackSectionViewed,
  trackScrollDepth,
} from './events';

/**
 * Custom React Hook for automatic single-page portfolio analytics.
 * Uses IntersectionObserver to track section visibility ONCE per session.
 * Monitors window scroll depth to fire 25%, 50%, 75%, and 100% milestone events ONCE per session.
 */
export function useAnalyticsTracker() {
  const viewedSectionsRef = useRef<Set<string>>(new Set());
  const trackedScrollDepthsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Fire Portfolio Viewed on initial load
    trackPortfolioViewed({ entry_point: 'Landing Page' });

    // 2. Setup IntersectionObserver for portfolio sections
    const sectionMap: Record<string, PortfolioSectionName> = {
      'about-section': PORTFOLIO_SECTIONS.ABOUT,
      'experience-section': PORTFOLIO_SECTIONS.EXPERIENCE,
      'projects-section': PORTFOLIO_SECTIONS.PROJECTS,
      'research-section': PORTFOLIO_SECTIONS.RESEARCH,
      'skills-section': PORTFOLIO_SECTIONS.SKILLS,
      'contact-section': PORTFOLIO_SECTIONS.CONTACT,
    };

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const sectionName = sectionMap[sectionId];

          if (sectionName && !viewedSectionsRef.current.has(sectionId)) {
            // Mark as viewed so it only fires ONCE per session
            viewedSectionsRef.current.add(sectionId);

            trackSectionViewed({
              section_name: sectionName,
              section_id: sectionId,
            });

            // Stop observing this element once tracked
            observer.unobserve(entry.target);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.3, // Section must be 30% visible in viewport
    });

    Object.keys(sectionMap).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // 3. Scroll Depth Tracking with requestAnimationFrame throttling for optimal 60fps performance
    let ticking = false;

    const calculateScrollDepth = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (docHeight <= windowHeight) {
        ticking = false;
        return;
      }

      const totalScrollable = docHeight - windowHeight;
      const currentScrollPercent = Math.round((scrollTop / totalScrollable) * 100);

      const milestones: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];

      milestones.forEach(milestone => {
        if (
          currentScrollPercent >= milestone &&
          !trackedScrollDepthsRef.current.has(milestone)
        ) {
          trackedScrollDepthsRef.current.add(milestone);
          trackScrollDepth({ depth_percentage: milestone });
        }
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateScrollDepth);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

