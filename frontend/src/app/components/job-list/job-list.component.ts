import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService, Company, Job } from '../../services/job.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  autumnJobs: Job[] = [];
  activeTab: 'all' | 'remote' | 'kentucky' | 'hybrid' | 'autumn' = 'all';

  constructor(private jobService: JobService) { }

  ngOnInit(): void {
    this.jobService.getCompanies().subscribe(
      (companies) => {
        this.companies = companies;
        this.filteredCompanies = companies;
      },
      (error) => console.error('Error fetching companies:', error)
    );
  }

  showTab(tab: 'all' | 'remote' | 'kentucky' | 'hybrid' | 'autumn'): void {
    this.activeTab = tab;
    if (tab === 'all') {
      this.filteredCompanies = this.companies;
    } else if (tab === 'remote') {
      this.filteredCompanies = this.companies.filter(company => company.jobType === 'Remote');
    } else if (tab === 'kentucky') {
      this.filteredCompanies = this.companies.filter(company => 
        company.location.toLowerCase().includes('kentucky') || 
        company.location.toLowerCase().includes('ky') ||
        company.location.toLowerCase().includes('louisville') ||
        company.location.toLowerCase().includes('lexington')
      );
    } else if (tab === 'hybrid') {
      this.filteredCompanies = this.companies.filter(company => company.jobType === 'Hybrid');
    }
  }

  addJob(company: Company): void {
    const newJob: Job = {
      id: Date.now(),
      title: company.name,
      location: company.location,
      status: 'active',
      description: company.description,
    };
    
    // Add the job to Autumn's Jobs tab without making an API call
    this.autumnJobs.push(newJob);
  }

  deleteJob(company: Company): void {
    this.jobService.deleteJob(company.id).subscribe(
      () => {
        this.companies = this.companies.filter(c => c.id !== company.id);
        this.filteredCompanies = this.filteredCompanies.filter(c => c.id !== company.id);
      },
      (error: any) => console.error('Error deleting job:', error)
    );
  }

  removeAutumnJob(job: Job): void {
    this.autumnJobs = this.autumnJobs.filter(j => j.id !== job.id);
  }
}
