import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  name: string;
  location: string;
  description: string;
  jobType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl + '/jobs').pipe(
      catchError(this.handleError<Job[]>('getJobs', []))
    );
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/companies`).pipe(
      catchError(this.handleError<Company[]>('getCompanies', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
