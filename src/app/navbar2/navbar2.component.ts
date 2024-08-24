import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar2',
  templateUrl: './navbar2.component.html',
  styleUrl: './navbar2.component.scss'
})
export class Navbar2Component {
  private breakpointObserver = inject(BreakpointObserver);

  constructor(public router: Router) {}
  

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
