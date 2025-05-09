import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { environment } from '../../environments/environment';

export interface Point {
  id: number;
  day: number;
  order: number;
  notes?: string;
  point_details: {
    id: number;
    name: string;
    description: string;
    type: string;
    address: string;
    estimated_time: string;
    difficulty: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    created_at: string;
    updated_at: string;
  };
  point_of_interest: number;
  restaurant: null;
  event: null;
}

export interface Itinerary {
  id?: number;
  title: string;
  description: string;
  days: number;
  points: Point[];
  start_date: Date | string;
  end_date: Date | string;
  created_at?: string;
  updated_at?: string;
  user: null;
}

export interface ItineraryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Itinerary[];
}

@Injectable({
  providedIn: 'root'
})
export class ItineraryService {
  // private apiUrl = `${environment.apiUrl}/itineraries`;
  private apiUrl = 'https://geodjangov2.onrender.com/api/itineraries';  // URL para la demo
  private currentItinerarySubject = new BehaviorSubject<{itinerary: Itinerary | null, isFromGPT: boolean}>({itinerary: null, isFromGPT: false});
  currentItinerary$ = this.currentItinerarySubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllItineraries(): Observable<Itinerary[]> {
    return this.http.get<ItineraryResponse>(this.apiUrl).pipe(
      map(response => response.results.map(itinerary => ({
        ...itinerary,
        start_date: new Date(itinerary.start_date),
        end_date: new Date(itinerary.end_date),
        created_at: itinerary.created_at,
        updated_at: itinerary.updated_at
      })))
    );
  }

  getItineraryById(id: number): Observable<Itinerary> {
    return this.http.get<Itinerary>(`${this.apiUrl}/${id}`).pipe(
      map(itinerary => ({
        ...itinerary,
        start_date: new Date(itinerary.start_date),
        end_date: new Date(itinerary.end_date),
        created_at: itinerary.created_at,
        updated_at: itinerary.updated_at
      }))
    );
  }

  createItinerary(itinerary: Omit<Itinerary, 'id' | 'created_at' | 'updated_at'>): Observable<Itinerary> {
    return this.http.post<Itinerary>(this.apiUrl, itinerary);
  }

  updateItinerary(id: number, itinerary: Partial<Itinerary>): Observable<Itinerary> {
    return this.http.put<Itinerary>(`${this.apiUrl}/${id}`, itinerary);
  }

  deleteItinerary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setCurrentItinerary(itinerary: Itinerary, isFromGPT: boolean = true) {
    this.currentItinerarySubject.next({itinerary, isFromGPT});
  }

  addPoint(itineraryId: number, point: Omit<Point, 'id'>): Observable<Point> {
    return this.http.post<Point>(`${this.apiUrl}/${itineraryId}/points`, point);
  }

  updatePoint(itineraryId: number, pointId: number, point: Partial<Point>): Observable<Point> {
    return this.http.put<Point>(`${this.apiUrl}/${itineraryId}/points/${pointId}`, point);
  }

  deletePoint(itineraryId: number, pointId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itineraryId}/points/${pointId}`);
  }

  reorderPoints(itineraryId: number, points: { id: number; order: number; day: number }[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${itineraryId}/points/reorder`, { points });
  }
} 