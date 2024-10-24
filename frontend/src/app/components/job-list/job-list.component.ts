import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService, Company } from '../../services/job.service';

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

  filterCompanies(jobType: string | null): void {
    if (jobType === null) {
      this.filteredCompanies = this.companies;
    } else if (jobType === 'Kentucky') {
      this.filteredCompanies = this.companies.filter(company => 
        company.location.toLowerCase().includes('kentucky') || 
        company.location.toLowerCase().includes('ky') ||
        company.location.toLowerCase().includes('louisville') ||
        company.location.toLowerCase().includes('lexington')
      );
    } else {
      this.filteredCompanies = this.companies.filter(company => company.jobType === jobType);
    }
  }
}
