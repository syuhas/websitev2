import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import * as yaml from 'js-yaml';
import { Project } from '../project-model.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay, forkJoin } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { YamlService } from '../../services/yaml.service';
import * as Prism from '@syuhas22/prismjs';
import '@syuhas22/prismjs/components/prism-python';
// import 'prismjs/plugins/line-numbers/prism-line-numbers';
// import 'prismjs/plugins/custom-class/prism-custom-class';

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
  isSmallScreen$!: Observable<boolean>;
  private breakpointObserver = inject(BreakpointObserver);
  isExpanded: boolean = false;
  @ViewChild('codeBlock') codeBlock!: ElementRef<HTMLPreElement>;
  showButton: boolean = false;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private yamlService: YamlService,
  ){}

  ngOnInit() {

    this.yamlService
      .loadMasterYaml('assets/project_yaml/master.yaml')
      .subscribe(
        (projects) => {
          this.projects = projects;
          this.initializeProject();
        }
      )

    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab) {
        this.activeSection = tab;
        this.setTab(tab);
      }
    });

    this.isSmallScreen$ = this.breakpointObserver.observe([Breakpoints.Tablet, Breakpoints.Handset, Breakpoints.Medium, Breakpoints.Small]).pipe(
      map(result => result.matches),
      distinctUntilChanged(),
      shareReplay()
    )
  }

  initializeProject() {
    const projectId = String(this.route.snapshot.paramMap.get('id'));
    this.project = this.projects.find((p) => p.id === projectId) as Project;
  
    if (this.project) {
      this.project.sections.forEach((section) => {
        section.subsections.forEach((subsection) => {
          if (subsection.content) {
            subsection.content = this.sanitizer.bypassSecurityTrustHtml(subsection.content as string);
          }
          if (subsection.code) {
            subsection.code = this.sanitizer.bypassSecurityTrustHtml(subsection.code as string);
          }

          if (subsection.listItems) {
            subsection.listItems.forEach((listItem) => {
              listItem.text = this.sanitizer.bypassSecurityTrustHtml(listItem.text as string);
              if (listItem.subList) {
                listItem.subList = listItem.subList.map((subListItem) => 
                  this.sanitizer.bypassSecurityTrustHtml(subListItem as string)
                )
              }
            });
          }         

        });
      });
    }
  }

  setTab(tab: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    }).then(() => {
      if (typeof document !== 'undefined') {
        const container = document.querySelector('.mat-sidenav-content');
        if (container) {
          container.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }
    });
    this.activeSection = tab;
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        Prism.highlightAll();
      }, 0);
    }
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


}



  // ngOnInit() {
  //   const projectId = String(this.route.snapshot.paramMap.get('id'));
  //   this.http.get('assets/projects.yaml', {responseType: 'text'}).subscribe(data => {
  //     this.projects = yaml.load(data) as Project[];
  //     // this.project = this.projects.find(p => p.id === projectId) as Project;
  //     this.project = this.projects.find((p) => p.id === projectId) as Project;
      
  //     this.project.sections.forEach((section) => {
  //       section.subsections.forEach((subsection) => {
  //           if (subsection.content) {
  //             subsection.content = this.sanitizer.bypassSecurityTrustHtml(subsection.content as string);
  //           }
  //           if (subsection.code) {
  //             subsection.code = this.sanitizer.bypassSecurityTrustHtml(subsection.code as string);
  //           }
  //           if (subsection.listItems) {
  //             subsection.listItems = subsection.listItems.map((item) => this.sanitizer.bypassSecurityTrustHtml(item as string));
  //           }

  //       });
  //     });

  //     this.route.queryParams.subscribe((params) => {
  //       const tab = params['tab'];
  //       if (tab) {
  //         this.activeSection = tab;
  //         this.setTab(tab);
  //       }
  //     });
  //   });

  //   this.isSmallScreen$ = this.breakpointObserver.observe([Breakpoints.Tablet, Breakpoints.Handset, Breakpoints.Medium, Breakpoints.Small]).pipe(
  //     map(result => result.matches),
  //     distinctUntilChanged(),
  //     shareReplay()
  //   )
  // }


  
          // if (subsection.listItems) {
          //   subsection.listItems = subsection.listItems.map((item) =>
          //     this.sanitizer.bypassSecurityTrustHtml(item as string)
          //   );
          // }