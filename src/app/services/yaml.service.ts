import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import * as yaml from 'js-yaml';

@Injectable({
  providedIn: 'root',
})
export class YamlService {
  constructor(private http: HttpClient) {}

  loadMasterYaml(masterPath: string): Observable<any[]> {
    return new Observable((observer) => {
      this.http
        .get(masterPath, { responseType: 'text' })
        .subscribe((masterData) => {
          const masterYaml = yaml.load(masterData) as { includes: string[] };

          if (masterYaml.includes && masterYaml.includes.length > 0) {
            const fileRequests = masterYaml.includes.map((filePath) =>
              this.http.get(filePath, { responseType: 'text' })
            );

            forkJoin(fileRequests).subscribe(
              (fileContents) => {
                const projects = fileContents.flatMap((content) =>
                  yaml.load(content) as any[]
                );
                observer.next(projects);
                observer.complete();
              },
              (error) => observer.error(error)
            );
          } else {
            observer.next([]);
            observer.complete();
          }
        });
    });
  }
}
