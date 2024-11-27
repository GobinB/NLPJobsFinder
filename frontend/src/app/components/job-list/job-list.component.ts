import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService, Company, Job } from '../../services/job.service';
import { ResumeUploadComponent } from '../resume-upload/resume-upload.component';

interface Folder {
  name: string;
  jobs: Job[];
}

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ResumeUploadComponent],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  activeTab: 'all' | 'remote' | 'kentucky' | 'saved' = 'all';
  
  folders: Folder[] = [
    { name: 'Ahmed', jobs: [] },
    { name: 'Autumn', jobs: [] },
    { name: 'Emujin', jobs: [] },
    { name: 'Gobin', jobs: [] },
    { name: 'Professor', jobs: [] }
  ];

  selectedUser: string | null = null;
  selectedUserJobs: Job[] = [];
  private savedJobsBeforeFilter: Job[] = [];

  constructor(public jobService: JobService) {}

  ngOnInit(): void {
    this.jobService.filteredCompanies$.subscribe(
      (companies) => {
        this.companies = companies;
        if (this.activeTab === 'saved') {
          this.filterSavedJobs();
        } else {
          this.showTab(this.activeTab);
        }
      }
    );

    this.jobService.getCompanies().subscribe(
      () => {},
      (error) => console.error('Error fetching companies:', error)
    );

    this.loadFoldersFromStorage();
  }

  showTab(tab: 'all' | 'remote' | 'kentucky' | 'saved'): void {
    this.activeTab = tab;
    if (tab === 'saved') {
      this.loadSelectedUserJobs();
      return;
    }

    this.filteredCompanies = this.companies.filter(company => {
      switch (tab) {
        case 'all':
          return true;
        case 'remote':
          return company.jobType === 'Remote';
        case 'kentucky':
          return company.jobType === 'Kentucky';
        default:
          return true;
      }
    });
  }

  onUserSelect(event: any): void {
    this.loadSelectedUserJobs();
  }

  loadSelectedUserJobs(): void {
    if (this.selectedUser) {
      const folder = this.folders.find(f => f.name === this.selectedUser);
      if (folder) {
        this.savedJobsBeforeFilter = [...folder.jobs];
        this.filterSavedJobs();
      }
    } else {
      this.savedJobsBeforeFilter = [];
      this.selectedUserJobs = [];
    }
  }

  private filterSavedJobs(): void {
    if (!this.jobService.hasActiveFilter()) {
      this.selectedUserJobs = [...this.savedJobsBeforeFilter];
      return;
    }

    const preferences = this.jobService.getCurrentPreferences();
    if (!preferences) {
      this.selectedUserJobs = [...this.savedJobsBeforeFilter];
      return;
    }

    this.selectedUserJobs = this.savedJobsBeforeFilter.filter(job => {
      const locationMatch = preferences.locations.some(loc => 
        job.location.toLowerCase().includes(loc.toLowerCase())
      );
      
      const remoteMatch = preferences.hasRemoteExperience && 
        job.location.toLowerCase().includes('remote');

      return locationMatch || remoteMatch;
    });
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
      jobType: company.jobType,
      region: company.region,
      isRemote: company.jobType === 'Remote',
      isKentucky: company.jobType === 'Kentucky'
    };

    const folder = this.folders.find(f => f.name === this.selectedUser);
    if (folder) {
      const jobExists = folder.jobs.some(
        (job) => job.title === company.name && job.location === company.location
      );

      if (!jobExists) {
        folder.jobs.push(newJob);
        this.savedJobsBeforeFilter = [...folder.jobs];
        this.filterSavedJobs();
        this.saveFoldersToStorage();
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
