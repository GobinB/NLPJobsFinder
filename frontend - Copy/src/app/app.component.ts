import { Component } from '@angular/core';
import { JobListComponent } from './components/job-list/job-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JobListComponent],
  template: '<app-job-list></app-job-list>',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'NLP Jobs Finder';
}
