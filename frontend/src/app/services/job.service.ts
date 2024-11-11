import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Job {
  id: number;
  title: string;
  location: string;
  status: string;
  description: string;
  isRemote?: boolean;
  isKentucky?: boolean;
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

  constructor(private http: HttpClient) { }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs`).pipe(
      catchError(this.handleError<Job[]>('getJobs', []))
    );
  }
  

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/companies`).pipe(
      map(companies => companies.map(company => this.classifyCompany(company))),
      catchError(this.handleError<Company[]>('getCompanies', []))

    );
  }

  private classifyCompany(company: Company): Company {
    const description = company.description.toLowerCase();
    const location = company.location.toLowerCase();
    const tokens = description.split(' ').concat(location.split(' '));
    const isRemote = this.remoteKeywords.some(keyword => 
      tokens.includes(keyword) || description.includes(keyword) || location.includes(keyword)
    );
    const isHybrid = this.hybridKeywords.some(keyword => 
      tokens.includes(keyword) || description.includes(keyword) || location.includes(keyword)
    );
    const isUSALocation = this.usaLocations.some(keyword => tokens.includes(keyword));
   
    let jobType = 'On-site';
    if (isRemote && !isHybrid) jobType = 'Remote';
    else if (isHybrid) jobType = 'Hybrid';
    let region = 'Unknown';
    if (isUSALocation) region = 'USA';
    return { ...company, jobType, region, isRemote, isKentucky: location.includes('kentucky') };
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };

  }

}
