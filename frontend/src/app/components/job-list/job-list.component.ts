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

    this.loadFoldersFromStorage();
  }

  onUserSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedUser = selectElement.value;
    console.log('Selected User:', this.selectedUser);
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
      if (folder) {
        console.log(`Loading jobs for ${this.selectedUser}`);
      } else {
        console.error(`No folder found for user: ${this.selectedUser}`);
      }
      this.selectedUserJobs = folder ? folder.jobs : [];
    }
  }

  addJob(company: Company): void {
    if (!this.selectedUser) {
      alert("Please select a user before adding a job.");
      return;
    }

    const folder = this.folders.find(f => f.name === this.selectedUser);
    if (folder) {
      const jobExists = folder.jobs.some(
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

        folder.jobs.push(newJob);
        this.selectedUserJobs = folder.jobs;
        console.log(`Added job to ${this.selectedUser}'s folder`, newJob);
        this.saveFoldersToStorage();
      } else {
        console.log('Job already exists in the selected user\'s list.');
      }
    } else {
      console.error(`Folder not found for user: ${this.selectedUser}`);
    }
  }

  removeJobFromUserFolder(job: Job): void {
    if (this.selectedUser) {
      const folder = this.folders.find(f => f.name === this.selectedUser);
      if (folder) {
        folder.jobs = folder.jobs.filter(j => j.id !== job.id);
        this.selectedUserJobs = folder.jobs;
        this.saveFoldersToStorage();
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
