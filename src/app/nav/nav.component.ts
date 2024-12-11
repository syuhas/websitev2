import { Component, HostListener, OnInit, Renderer2, ElementRef, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  opened = true;
  isHandset$!: Observable<boolean>;
  
  private breakpointObserver = inject(BreakpointObserver);
  

  constructor(
    public router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    
  ) {}

  ngOnInit() {
    this.opened = true;
    if (isPlatformBrowser(this.platformId)) {
      this.updateIconScale();
    }
    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Tablet, Breakpoints.Handset, Breakpoints.Medium, Breakpoints.Small]).pipe(
      map(result => result.matches),
      distinctUntilChanged(),
      shareReplay()
    )
    this.closeIfHandset();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (isPlatformBrowser(this.platformId)) {
      this.updateIconScale();
    }
  }

  updateIconScale() {
    if (isPlatformBrowser(this.platformId)) {
      const icons = this.el.nativeElement.querySelectorAll('.custom-icon');
      let scaleFactor = window.innerWidth / 1000;
      const minScaleFactor = 1;

      if (scaleFactor < minScaleFactor) {
        scaleFactor = minScaleFactor;
      }
      icons.forEach((icon: HTMLElement) => {
        this.renderer.setStyle(icon, 'transform', `scale(${scaleFactor})`);
      });
    }
  }
  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  closeIfHandset() {
    this.isHandset$.subscribe(isHandset => {
      console.log('isHandset:', isHandset);
      if (isHandset) {
        this.opened = false;
      } else {
        this.opened = true;
      }
    });
  }

  goToGithub() {
    window.open('https://github.com/syuhas?tab=repositories', '_blank');
  }

  goToLinkedin() {
    window.open('https://www.linkedin.com/in/stephen-yuhas/', '_blank');
  }

  goToEmail() {
    window.open('mailto:syuhas22@gmail.com', '_blank');
  }

}