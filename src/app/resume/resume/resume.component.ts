import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, OnInit } from '@angular/core';
import { distinctUntilChanged, map, Observable, shareReplay } from 'rxjs';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent implements OnInit {
  baseUrl = 'https://s3.us-east-1.amazonaws.com/www.digitalsteve.net/';
  resume = ''
  isSmallScreen$!: Observable<boolean>;
  private breakpointObserver = inject(BreakpointObserver);


  constructor() { }

  ngOnInit() {
    this.isSmallScreen$ = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Medium, Breakpoints.Small]).pipe(
      map(result => result.matches),
      distinctUntilChanged(),
      shareReplay()
    )
  }

  downloadResumeDoc() {
    let url = this.baseUrl + 'Stephen_Yuhas_Resume.docx';
    window.open(url, '_blank');
  }

  downloadResumePdf() {
    let url = this.baseUrl + 'Stephen_Yuhas_Resume.pdf';
    window.open(url, '_blank');
  }

  goToBadgeCCP() {
    window.open('https://www.credly.com/badges/1157d588-e4d9-4b26-9c4b-cb4572976338/public_url', '_blank');
  }

  goToBadgeSAA() {
    window.open('https://www.credly.com/badges/7f18c1d3-05db-4129-afc1-a913ab5058c6/public_url', '_blank');
  }

}
