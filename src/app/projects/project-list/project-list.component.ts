import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import * as yaml from 'js-yaml';
import { Project } from '../project-model.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, distinctUntilChanged, shareReplay, Observable } from 'rxjs';
import { YamlService } from '../../services/yaml.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ProjectListComponent implements OnInit{
  projects: Project[] = [];
  project!: Project;
  page = 1;
  pageSize = 6;
  isSmallScreen$!: Observable<boolean>;
  private breakpointObserver = inject(BreakpointObserver);
  
  constructor (
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private yamlService: YamlService
  ){}
  ngOnInit() {
    // const projectId = String(this.route.snapshot.paramMap.get('id'));
    // this.http.get('assets/projects.yaml', {responseType: 'text'}).subscribe(data => {
    //   this.projects = yaml.load(data) as Project[];
    // });
    this.yamlService
      .loadMasterYaml('assets/project_yaml/master.yaml')
      .subscribe(
        (projects) => {
          this.projects = projects;
        }
      );

    this.isSmallScreen$ = this.breakpointObserver.observe([Breakpoints.Handset, '(max-width: 768px)']).pipe(
      map(result => result.matches),
      distinctUntilChanged(),
      shareReplay()
    );
    this.changePageSizeBasedOnScreenSize();
  }

    goToProject(project: Project) {
    this.router.navigate(['/projects', project.id]);
    }

    changePageSizeBasedOnScreenSize() {
    this.isSmallScreen$.subscribe((isSmallScreen) => {
      this.pageSize = isSmallScreen ? 3 : 6;
    });
    }
    
  }
