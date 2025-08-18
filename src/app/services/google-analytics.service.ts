import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  private isDebugMode = false;

  constructor() {
    // Enable debug mode in development
    if (typeof window !== 'undefined') {
      this.isDebugMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
  }

  // Track page views
  trackPageView(url: string, title?: string) {
    if (this.isDebugMode) {
      console.log('🔍 GA Page View:', { url, title });
    }
    
    // Use setTimeout to ensure gtag is available
    setTimeout(() => {
      if (typeof gtag !== 'undefined') {
        gtag('config', 'G-NVXDSQ958D', {
          page_path: url,
          page_title: title
        });
      } else if (this.isDebugMode) {
        console.warn('⚠️ gtag not available for page view tracking');
      }
    }, 100);
  }

  // Track custom events
  trackEvent(eventAction: string, eventCategory: string, eventLabel?: string, value?: number) {
    const eventData = {
      event_category: eventCategory,
      event_label: eventLabel,
      value: value
    };
    
    if (this.isDebugMode) {
      console.log('🔍 GA Event:', eventAction, eventData);
    }
    
    // Use setTimeout to ensure gtag is available
    setTimeout(() => {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventAction, eventData);
      } else if (this.isDebugMode) {
        console.warn('⚠️ gtag not available for event tracking');
      }
    }, 100);
  }

  // Specific tracking methods for your site
  trackProjectView(projectId: string, projectTitle: string) {
    this.trackEvent('view_project', 'Projects', `${projectId}: ${projectTitle}`, 1);
  }

  trackProjectTabChange(projectId: string, tabName: string) {
    this.trackEvent('tab_change', 'Projects', `${projectId} - ${tabName}`, 1);
  }

  trackResumeDownload(format: string) {
    this.trackEvent('download', 'Resume', format, 1);
  }

  trackExternalLinkClick(linkType: string, url: string) {
    this.trackEvent('click', 'External Links', `${linkType}: ${url}`, 1);
  }

  trackCertificationClick(certificationName: string) {
    this.trackEvent('click', 'Certifications', certificationName, 1);
  }

  trackNavigation(route: string) {
    this.trackEvent('navigate', 'Navigation', route, 1);
  }

  trackImagePreview(imageUrl: string, projectId?: string) {
    this.trackEvent('image_preview', 'UI Interaction', `${projectId ? projectId + ': ' : ''}${imageUrl}`, 1);
  }
}
