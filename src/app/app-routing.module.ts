import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ProjectsComponent } from './projects/projects/projects.component';
import { ResumeComponent } from './resume/resume/resume.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    component: HomepageComponent
  },
  {
    path: 'projects',
    component: ProjectsComponent
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
