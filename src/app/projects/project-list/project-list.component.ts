import { Component, OnInit } from '@angular/core';
import * as yaml from 'js-yaml';
import { Project } from '../project-model.model';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit{
  projects: Project[] = [];
  project!: Project;

  constructor (
    private route: ActivatedRoute,
    private http: HttpClient
  ){}
  ngOnInit() {
    const projectId = String(this.route.snapshot.paramMap.get('id'));
    this.http.get('assets/projects.yaml', {responseType: 'text'}).subscribe(data => {
      this.projects = yaml.load(data) as Project[];
    }
  )}
  
}
