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

  filterCompanies(filterType: string | null): void {
    if (filterType === null) {
      this.filteredCompanies = this.companies;
    } else if (filterType === 'Kentucky') {
      // Match "kentucky" or standalone "ky" as whole words only
      this.filteredCompanies = this.companies.filter(company => 
        /\b(kentucky|ky)\b/i.test(company.location) || 
        /\b(louisville|lexington)\b/i.test(company.location)
      );
    } else if (filterType === 'USA') {
      this.filteredCompanies = this.companies.filter(company => company.region === 'USA');
    } else {
      this.filteredCompanies = this.companies.filter(company => company.jobType === filterType);
    }
  }
  
}
