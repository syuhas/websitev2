import { Component, HostListener, OnInit } from '@angular/core';
import * as yaml from 'js-yaml';
import { Project } from '../project-model.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  project!: Project;
  projects: Project[] = [];
  activeSection: string = 'Overview';
  previewImage: string = '';
  detailPreviewImage: string = '';
  showPreview: boolean = false;
  showDetailPreview: boolean = false;
  isSmallScreen: boolean = false;
  activeTabIndex: number = 0; // Tracks the currently active tab

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ){}

  ngOnInit() {
    const projectId = String(this.route.snapshot.paramMap.get('id'));
    this.http.get('assets/projects.yaml', {responseType: 'text'}).subscribe(data => {
      this.projects = yaml.load(data) as Project[];
      this.project = this.projects.find(p => p.id === projectId) as Project;
      this.project = this.projects.find((p) => p.id === projectId) as Project;
      
      this.project.sections.forEach((section) => {
        section.subsections.forEach((subsection) => {
            if (subsection.content) {
              subsection.content = this.sanitizer.bypassSecurityTrustHtml(subsection.content as string);
            }
            if (subsection.code) {
              subsection.code = this.sanitizer.bypassSecurityTrustHtml(subsection.code as string);
            }
            if (subsection.listItems) {
              subsection.listItems = subsection.listItems.map((item) => this.sanitizer.bypassSecurityTrustHtml(item as string));
            }

        });
      });

      //  if I decide to go back to mat tabs

      // this.route.queryParams.subscribe((params) => {
      //   if (this.project.sections[0]) {
      //     const tabTitle = params['tab'] || this.project.sections[0].tabTitle;
      //     this.activeTabIndex = this.project.sections.findIndex(
      //       (section: any) => section.tabTitle === tabTitle
      //     );
      //   }
      // });
      this.route.queryParams.subscribe((params) => {
        const tab = params['tab'];
        if (tab) {
          this.activeSection = tab;
          this.setTab(tab);
        }
      });
    });
  }

  setTab(tab: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
    this.activeSection = tab;
  }


  openPreview(imageUrl: string): void {
    this.previewImage = imageUrl;
    this.showPreview = true;
  }

  openDetailPreview(imageUrl: string): void {
    this.detailPreviewImage = imageUrl;
    this.showDetailPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
    this.showDetailPreview = false;
  }

  // testing for small screen select idea, remove later if not used
  @HostListener('window:resize', [])
  onResize() {
    this.isSmallScreen = window.innerWidth < 1200; // Adjust based on your breakpoint
    console.log(this.isSmallScreen);
  }

  //  for mat tabs, remove later if not using mat tabs
  setActiveTab(index: number): void {
    this.activeTabIndex = index;
    const tab = this.project.sections[index].tabTitle;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
    this.activeSection = tab;
  }

}