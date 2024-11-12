import { Component, OnInit } from '@angular/core';
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
    });

    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] || 'Overview';
      this.setTab(tab);
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
}
