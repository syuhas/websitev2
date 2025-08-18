import { TestBed } from '@angular/core/testing';
import { GoogleAnalyticsService } from './google-analytics.service';

// Mock gtag function
declare let gtag: jasmine.Spy;

describe('GoogleAnalyticsService', () => {
  let service: GoogleAnalyticsService;

  beforeEach(() => {
    // Mock gtag function
    (window as any).gtag = jasmine.createSpy('gtag');
    
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should track page views', () => {
    service.trackPageView('/home', 'Home Page');
    expect((window as any).gtag).toHaveBeenCalledWith('config', 'G-NVXDSQ958D', {
      page_path: '/home',
      page_title: 'Home Page'
    });
  });

  it('should track events', () => {
    service.trackEvent('click', 'button', 'header-button', 1);
    expect((window as any).gtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'button',
      event_label: 'header-button',
      value: 1
    });
  });

  it('should track project views', () => {
    service.trackProjectView('test-project', 'Test Project');
    expect((window as any).gtag).toHaveBeenCalledWith('event', 'view_project', {
      event_category: 'Projects',
      event_label: 'test-project: Test Project',
      value: 1
    });
  });

  it('should track resume downloads', () => {
    service.trackResumeDownload('PDF');
    expect((window as any).gtag).toHaveBeenCalledWith('event', 'download', {
      event_category: 'Resume',
      event_label: 'PDF',
      value: 1
    });
  });
});
