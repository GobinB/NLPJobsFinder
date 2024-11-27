import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resume-section">
      <div class="resume-upload-container">
        <div class="upload-area" [class.has-file]="selectedFile">
          <input 
            type="file" 
            (change)="onFileSelected($event)"
            accept=".pdf,.doc,.docx"
            #fileInput
            style="display: none"
          >
          <div class="upload-content" (click)="fileInput.click()">
            <i class="upload-icon">📄</i>
            <div class="upload-text">
              <h3>{{ selectedFile ? selectedFile.name : 'Upload Your Resume' }}</h3>
              <p>{{ selectedFile ? 'Click to change file' : 'Drop your resume here or click to browse' }}</p>
            </div>
          </div>
        </div>
        
        <div class="status-area">
          <div *ngIf="loading" class="status loading">
            <div class="spinner"></div>
            Processing resume...
          </div>
          <div *ngIf="error" class="status error">
            <i class="error-icon">❌</i>
            {{ error }}
          </div>
          <div *ngIf="success" class="status success">
            <i class="success-icon">✅</i>
            Resume processed! Jobs have been filtered based on your experience.
            <button (click)="resetFilters()" class="reset-button">Reset Filters</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resume-section {
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .resume-upload-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .upload-area {
      background: white;
      border: 2px dashed #007bff;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .upload-area:hover {
      border-color: #0056b3;
      background: #f8f9fa;
    }

    .upload-area.has-file {
      border-style: solid;
      border-color: #28a745;
    }

    .upload-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .upload-icon {
      font-size: 2.5rem;
      color: #007bff;
    }

    .upload-text {
      flex: 1;
    }

    .upload-text h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .upload-text p {
      margin: 5px 0 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .status-area {
      margin-top: 10px;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 15px;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .loading {
      background: #e3f2fd;
      color: #0d47a1;
    }

    .error {
      background: #ffebee;
      color: #c62828;
    }

    .success {
      background: #e8f5e9;
      color: #2e7d32;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #0d47a1;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .reset-button {
      padding: 6px 12px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background-color 0.2s;
    }

    .reset-button:hover {
      background: #c82333;
    }
  `]
})
export class ResumeUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  loading = false;
  error = '';
  success = false;

  constructor(private jobService: JobService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadResume(file);
    }
  }

  private uploadResume(file: File) {
    this.loading = true;
    this.error = '';
    this.success = false;

    this.jobService.parseResume(file).subscribe(
      (result) => {
        this.loading = false;
        this.success = true;
        this.jobService.updateJobPreferences(result);
      },
      (error) => {
        this.loading = false;
        this.error = 'Error processing resume. Please try again.';
        this.success = false;
        console.error('Resume processing error:', error);
      }
    );
  }

  resetFilters() {
    this.selectedFile = null;
    this.success = false;
    this.error = '';
    // Reset the file input value
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.jobService.resetFilters();
  }
} 