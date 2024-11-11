import { Injectable } from '@angular/core';

export interface Job {
  id: number;
  title: string;
  location: string;
  status: string;
  description: string;
  type?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  // This service could expand to interact with backend if required
}
