import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as yaml from 'js-yaml';
import { Project } from '../project-model.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';

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

  constructor (
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ){}
  ngOnInit() {
    // const projectId = String(this.route.snapshot.paramMap.get('id'));
    this.http.get('assets/projects.yaml', {responseType: 'text'}).subscribe(data => {
      this.projects = yaml.load(data) as Project[];
    }
  )}

  goToProject(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }
  
}
