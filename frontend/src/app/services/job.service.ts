import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  name: string;
  location: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:3000/api'; // Adjust if your backend URL or port changes

  constructor(private http: HttpClient) { } 

  // Fetch companies from /api/jobs
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/jobs`);
  }

  // Parse location using /parse-location endpoint
  parseLocation(locationText: string): Observable<any> {
    const params = new HttpParams().set('text', locationText);
    return this.http.get<any>(`${this.apiUrl}/parse-location`, { params });
  }
}
