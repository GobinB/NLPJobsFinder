import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService, Company, Job } from '../../services/job.service';

interface Folder {
  name: string;
  jobs: Job[];
}

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  activeTab: 'all' | 'remote' | 'kentucky' | 'hybrid' | 'saved' = 'all';
  
  folders: Folder[] = [
    { name: 'Ahmed', jobs: [] },
    { name: 'Autumn', jobs: [] },
    { name: 'Emujin', jobs: [] },
    { name: 'Gobin', jobs: [] },
    { name: 'Professor', jobs: [] }
  ];

  selectedUser: string | null = null;
  selectedUserJobs: Job[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.jobService.getCompanies().subscribe(
      (companies) => {
        this.companies = companies.map(company => ({
          ...company,
          jobType: this.getJobType(company)  // Assign job type based on location or description
        }));
        this.filteredCompanies = this.companies;  // Start with all companies
      },
      (error) => console.error('Error fetching companies:', error)
    );

    // Load saved folder jobs from local storage
    this.loadFoldersFromStorage();
  }

  // Function to assign job types based on description and location keywords
  getJobType(company: Company): string {
    const location = company.location.toLowerCase();
    const description = company.description.toLowerCase();
    
    if (location.includes('remote')) {
      return 'Remote';
    } else if (
      location.includes('kentucky') ||
      location.includes('ky') ||
      location.includes('louisville') ||
      location.includes('lexington')
    ) {
      return 'Kentucky';
    } else if (description.includes('hybrid')) {
      return 'Hybrid';
    }
    return 'Other';  // Default if no match
  }

  onUserSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedUser = selectElement.value;
    this.loadSelectedUserJobs();
  }

  showTab(tab: 'all' | 'remote' | 'kentucky' | 'hybrid' | 'saved'): void {
    this.activeTab = tab;
    switch (tab) {
      case 'all':
        this.filteredCompanies = this.companies;
        break;
      case 'remote':
        this.filteredCompanies = this.companies.filter(company => company.jobType === 'Remote');
        break;
      case 'kentucky':
        this.filteredCompanies = this.companies.filter(company => company.jobType === 'Kentucky');
        break;
      case 'hybrid':
        this.filteredCompanies = this.companies.filter(company => company.jobType === 'Hybrid');
        break;
      case 'saved':
        this.loadSelectedUserJobs();
        break;
    }
  }

  loadSelectedUserJobs(): void {
    if (this.selectedUser) {
      const folder = this.folders.find(f => f.name === this.selectedUser);
      this.selectedUserJobs = folder ? folder.jobs : [];
    } else {
      this.selectedUserJobs = []; // Reset jobs if no user is selected
    }
  }

  addJob(company: Company): void {
    if (!this.selectedUser) {
      alert("Please select a user before adding a job.");
      return;
    }

    const newJob: Job = {
      id: Date.now(),
      title: company.name,
      location: company.location,
      status: 'active',
      description: company.description,
    };

    const folder = this.folders.find(f => f.name === this.selectedUser);
    if (folder) {
      const jobExists = folder.jobs.some(
        (job) => job.title === company.name && job.location === company.location && job.description === company.description
      );

      if (!jobExists) {
        folder.jobs.push(newJob);
        this.selectedUserJobs = folder.jobs;  // Update saved jobs list
        this.saveFoldersToStorage();  // Persist data in localStorage
      } else {
        console.log('Job already exists in the selected user\'s list.');
      }
    }
  }

  removeJobFromUserFolder(job: Job): void {
    if (this.selectedUser) {
      const folder = this.folders.find(f => f.name === this.selectedUser);
      if (folder) {
        folder.jobs = folder.jobs.filter(j => j.id !== job.id);
        this.selectedUserJobs = folder.jobs; // Update the displayed jobs list
        this.saveFoldersToStorage();  // Persist data in localStorage
      }
    }
  }

  isJobSavedBySelectedUser(company: Company): boolean {
    if (!this.selectedUser) {
      return false;
    }

    const folder = this.folders.find(f => f.name === this.selectedUser);
    if (!folder) {
      console.error(`No folder found for user: ${this.selectedUser}`);
      return false;
    }

    return folder.jobs.some(
      (job) => job.title === company.name && job.location === company.location && job.description === company.description
    );
  }

  private saveFoldersToStorage(): void {
    localStorage.setItem('folders', JSON.stringify(this.folders));
  }

  private loadFoldersFromStorage(): void {
    const savedFolders = localStorage.getItem('folders');
    if (savedFolders) {
      this.folders = JSON.parse(savedFolders);
    }
  }
}
