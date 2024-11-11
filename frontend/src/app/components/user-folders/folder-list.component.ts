import { Component, OnInit } from '@angular/core';
import { FolderService, Job } from '../../services/folder.service';

interface Folder {
  name: string;
  jobs: Job[];
}

@Component({
  selector: 'app-folder-list',
  templateUrl: './folder-list.component.html',
  styleUrls: ['./folder-list.component.css']
})
export class FolderListComponent implements OnInit {
  folders: Folder[] = [
    { name: 'Ahmed', jobs: [] },
    { name: 'Autumn', jobs: [] },
    { name: 'Emujin', jobs: [] },
    { name: 'Gobin', jobs: [] },
    { name: 'Professor', jobs: [] }
  ];
  selectedFolder: string | null = null;
  selectedFolderJobs: Job[] = [];
  hybridJobs: Job[] = []; // List of hybrid jobs
  activeTab: 'folder' | 'hybrid' = 'folder'; // Controls the active view

  constructor(private folderService: FolderService) {}

  ngOnInit(): void {
    this.loadJobsFromStorage();
    this.filterHybridJobs();
  }

  onFolderSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const folderName = target?.value;
    if (folderName) {
      this.selectFolder(folderName);
    }
  }

  selectFolder(folderName: string): void {
    this.selectedFolder = folderName;
    this.selectedFolderJobs = this.getJobsForFolder(folderName);
    this.activeTab = 'folder'; // Switch to folder view
  }

  filterHybridJobs(): void {
    this.hybridJobs = this.folders
      .flatMap(folder => folder.jobs)
      .filter(job => job.type === 'Hybrid');
  }

  showHybridJobs(): void {
    this.activeTab = 'hybrid'; // Switch to hybrid jobs view
  }

  addJobToFolder(folderName: string | null, job: Job): void {
    if (!folderName) return;
    
    const folder = this.folders.find(f => f.name === folderName);
    if (folder) {
      folder.jobs.push(job);
      this.selectedFolderJobs = folder.jobs; // Update current folder jobs
      this.saveJobsToStorage();
    }
  }

  removeJobFromFolder(job: Job): void {
    if (this.selectedFolder) {
      const folder = this.folders.find(f => f.name === this.selectedFolder);
      if (folder) {
        folder.jobs = folder.jobs.filter(j => j.id !== job.id);
        this.selectedFolderJobs = folder.jobs;
        this.saveJobsToStorage();
      }
    }
  }

  private loadJobsFromStorage(): void {
    const savedFolders = localStorage.getItem('folders');
    if (savedFolders) {
      this.folders = JSON.parse(savedFolders);
    }
  }

  private saveJobsToStorage(): void {
    localStorage.setItem('folders', JSON.stringify(this.folders));
  }

  private getJobsForFolder(folderName: string): Job[] {
    const folder = this.folders.find(f => f.name === folderName);
    return folder ? folder.jobs : [];
  }
}
