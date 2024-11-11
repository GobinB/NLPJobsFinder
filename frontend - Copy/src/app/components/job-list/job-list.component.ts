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
        this.companies = companies;
        this.filteredCompanies = companies; // Start with all companies
      },
      (error) => console.error('Error fetching companies:', error)
    );

    // Load saved folder jobs from local storage
    this.loadFoldersFromStorage();
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
        this.filteredCompanies = this.companies.filter(company => 
          company.location.toLowerCase().includes('kentucky') ||
          company.location.toLowerCase().includes('ky') ||
          company.location.toLowerCase().includes('louisville') ||
          company.location.toLowerCase().includes('lexington')
        );
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
      folder.jobs.push(newJob);
      this.selectedUserJobs = folder.jobs;  // Update saved jobs list
      this.saveFoldersToStorage();  // Persist data in localStorage
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
