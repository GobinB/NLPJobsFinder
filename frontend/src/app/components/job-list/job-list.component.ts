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
  parsedLocationData: any;

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    // Fetch the list of companies on component initialization
    this.jobService.getCompanies().subscribe(
      (companies) => {
        this.companies = companies;
        this.filteredCompanies = companies; // Display all companies initially
      },
      (error) => console.error('Error fetching companies:', error)
    );
  }

  // Method to filter companies based on a given job type or location
  filterCompanies(jobType: string | null): void {
    if (jobType === null) {
      this.filteredCompanies = this.companies; // Show all companies if no filter is selected
    } else if (jobType === 'Kentucky') {
      // Parse location for "Kentucky" using the backend location parser
      this.parseLocation('ky');
    } else {
      // Filter companies by job type
      this.filteredCompanies = this.companies.filter(company => company.location.toLowerCase().includes(jobType.toLowerCase()));
    }
  }

  // Method to parse location using the /parse-location endpoint
  parseLocation(locationText: string): void {
    this.jobService.parseLocation(locationText).subscribe(
      (data) => {
        this.parsedLocationData = data;
        console.log('Parsed location data:', data);

        // Filter companies based on parsed location data
        this.filteredCompanies = this.companies.filter(company => 
          data.some((item: { company: string; location: string; description: string }) => item.location.toLowerCase() === company.location.toLowerCase())
        );
      },
      (error) => console.error('Error parsing location:', error)
    );
  }
}
