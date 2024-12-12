import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnInit } from '@angular/core';
import { distinctUntilChanged, map, Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
  isSmallScreen$!: Observable<boolean>;
  private breakpointObserver = inject(BreakpointObserver);
  
  constructor() {}
  
  ngOnInit() {
    this.isSmallScreen$ = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Medium, Breakpoints.Small]).pipe(
      map(result => result.matches),
      distinctUntilChanged(),
      shareReplay()
    )
  }
  

}
