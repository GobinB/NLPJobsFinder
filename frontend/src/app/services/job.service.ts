import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Job {
  id: number;
  title: string;
  location: string;
  status: string;
  description: string;
  isRemote?: boolean;
  isKentucky?: boolean;
  jobType?: string;
  region?: string;
}

export interface Company {
  id: number;
  name: string;
  location: string;
  description: string;
  jobType?: string;
  region?: string;
  isRemote?: boolean;
  isKentucky?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:3000/api';

  private remoteKeywords = ['remote', 'work from home', 'telecommute', 'virtual', 'anywhere'];
  private hybridKeywords = ['hybrid', 'flexible', 'partially remote'];
  private usaLocations = ['usa', 'united states', 'kentucky'];

  private resumePreferences: {
    locations: string[];
    hasRemoteExperience: boolean;
    organizations: string[];
  } | null = null;

  private filteredCompaniesSubject = new BehaviorSubject<Company[]>([]);
  filteredCompanies$ = this.filteredCompaniesSubject.asObservable();
  private allCompanies: Company[] = [];

  constructor(private http: HttpClient) { }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs`).pipe(
      catchError(this.handleError<Job[]>('getJobs', []))
    );
  }
  

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/companies`).pipe(
      map(companies => {
        this.allCompanies = companies.map(company => this.classifyCompany(company));
        this.filteredCompaniesSubject.next(this.allCompanies);
        return this.allCompanies;
      }),
      catchError(this.handleError<Company[]>('getCompanies', []))
    );
  }

  private classifyCompany(company: Company): Company {
    const { jobType, region } = this.classifyJobType(company.description, company.location);
    return { 
      ...company, 
      jobType, 
      region,
      isRemote: jobType === 'Remote',
      isKentucky: jobType === 'Kentucky'
    };
  }

  private classifyJobType(description: string, location: string): { jobType: string; region: string } {
    const locationLower = location.toLowerCase();
    const descriptionLower = description.toLowerCase();

    // Check for Kentucky first
    const kentuckyPatterns = [
      /\bky\b/,
      /\bkentucky\b/,
      /\blexington,?\s*ky\b/,
      /\blouisville,?\s*ky\b/
    ];
    
    const isKentucky = kentuckyPatterns.some(pattern => pattern.test(locationLower));
    const isRemote = this.remoteKeywords.some(keyword => 
      locationLower.includes(keyword) || descriptionLower.includes(keyword)
    );
    const isHybrid = this.hybridKeywords.some(keyword => 
      locationLower.includes(keyword) || descriptionLower.includes(keyword)
    );

    let jobType = 'On-site';
    if (isKentucky) jobType = 'Kentucky';
    else if (isRemote && !isHybrid) jobType = 'Remote';
    else if (isHybrid) jobType = 'Hybrid';

    const region = isKentucky || this.usaLocations.some(loc => locationLower.includes(loc)) 
      ? 'USA' 
      : 'Unknown';

    return { jobType, region };
  }

  addJob(job: Job): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/jobs`, job).pipe(
      catchError(this.handleError<Job>('addJob'))
    );
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/jobs/${id}`).pipe(
      catchError(this.handleError<void>('deleteJob'))
    );
  }

  parseResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('resume', file);

    return this.http.post(`${this.apiUrl}/resume-parse`, formData).pipe(
      catchError(this.handleError('parseResume', null))
    );
  }

  updateJobPreferences(preferences: any) {
    this.resumePreferences = preferences;
    // Emit the new filter state to all subscribers
    this.filterCompaniesByPreferences();
  }

  private filterCompaniesByPreferences() {
    if (!this.resumePreferences) {
      this.filteredCompaniesSubject.next(this.allCompanies);
      return;
    }

    const filteredCompanies = this.allCompanies.filter(company => {
      const locationMatch = this.resumePreferences!.locations.some(loc => 
        company.location.toLowerCase().includes(loc.toLowerCase())
      );
      
      const remoteMatch = this.resumePreferences!.hasRemoteExperience && 
        company.jobType === 'Remote';

      return locationMatch || remoteMatch;
    });

    this.filteredCompaniesSubject.next(filteredCompanies);
  }

  resetFilters() {
    this.resumePreferences = null;
    this.filteredCompaniesSubject.next(this.allCompanies);
    // Force a re-render of the current view
    this.filteredCompaniesSubject.next([...this.allCompanies]);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };

  }

  hasActiveFilter(): boolean {
    return this.resumePreferences !== null;
  }

  getCurrentPreferences() {
    return this.resumePreferences;
  }

}
