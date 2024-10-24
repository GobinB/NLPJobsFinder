import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:3000/api/jobs';

  constructor(private http: HttpClient) { }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>('http://localhost:3000/api/companies');
  }
}
