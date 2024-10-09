import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService, Job } from '../../services/job.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];

  constructor(private jobService: JobService) { }

  ngOnInit(): void {
    this.jobService.getJobs().subscribe(
      (jobs) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;
      },
      (error) => console.error('Error fetching jobs:', error)
    );
  }

  filterJobs(remote: boolean | null, kentucky: boolean | null, status: string | null): void {
    this.filteredJobs = this.jobs.filter(job => 
      (remote === null || job.isRemote === remote) &&
      (kentucky === null || job.isKentucky === kentucky) &&
      (status === null || job.status === status)
    );
  }
}
