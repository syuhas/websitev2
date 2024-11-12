import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ProjectsComponent } from './projects/projects/projects.component';
import { ResumeComponent } from './resume/resume/resume.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    component: HomepageComponent
  },
  {
    path: 'projects',
    component: ProjectsComponent,
  },
  { 
    path: 'projects/:id',
    component: ProjectDetailComponent
  },
  {
    path: 'resume',
    component: ResumeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
    routes, 
    { enableTracing: false, scrollPositionRestoration: 'enabled' }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
