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
        this.filteredCompanies = companies;
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
    if (tab === 'saved') {
      this.loadSelectedUserJobs();
    } else if (tab === 'all') {
      this.filteredCompanies = this.companies;
    }
  }

  loadSelectedUserJobs(): void {
    if (this.selectedUser) {
      const folder = this.folders.find(f => f.name === this.selectedUser);
      this.selectedUserJobs = folder ? folder.jobs : [];
    }
  }

  addJob(company: Company): void {
    // Find Autumn's folder
    const autumnFolder = this.folders.find(f => f.name === 'Autumn');
    if (!autumnFolder) {
      console.error("Autumn's folder not found.");
      return;
    }
  
    // Check if the job already exists in Autumn's Jobs before adding
    const jobExists = autumnFolder.jobs.some(
      (job) => job.title === company.name && job.location === company.location && job.description === company.description
    );
  
    if (!jobExists) {
      const newJob: Job = {
        id: Date.now(),
        title: company.name,
        location: company.location,
        status: 'active',
        description: company.description,
      };
  
      // Add the job to Autumn's Jobs folder
      autumnFolder.jobs.push(newJob);
      this.saveFoldersToStorage();  // Persist changes in localStorage
    } else {
      console.log('Job already exists in Autumn\'s Jobs.');
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
    if (!this.selectedUser) return false;
  
    const folder = this.folders.find(f => f.name === this.selectedUser);
    return folder ? folder.jobs.some(
      (job) => job.title === company.name && job.location === company.location && job.description === company.description
    ) : false;
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
