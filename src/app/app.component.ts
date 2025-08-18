import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'websitev2';
  sidebarExpanded = true;

  constructor(
    private router: Router,
    private ga: GoogleAnalyticsService
  ) {}

  ngOnInit() {
    // Track route changes
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.ga.trackPageView(event.urlAfterRedirects);
      });
  }
}
