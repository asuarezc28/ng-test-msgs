import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

export interface ChatRequest {
  start_date: string;
  end_date: string;
  query: string;
}

export interface ChatResponse {
  display: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://geodjangov2.onrender.com/api/generate-itinerary/';

  // ReplaySubject para comunicar puntos al mapa
  private itineraryPointsSubject = new BehaviorSubject<any>(null);
  itineraryPoints$ = this.itineraryPointsSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendQuery(query: string): Observable<ChatResponse> {
    // Fechas por defecto: hoy y hoy+2 días
    const today = new Date();
    const start_date = today.toISOString().slice(0, 10);
    const end_date = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const body: ChatRequest = {
      start_date,
      end_date,
      query
    };
    return this.http.post<ChatResponse>(this.apiUrl, body);
  }

  // Método para emitir puntos al mapa
  emitItineraryPoints(points: any) {
    debugger;
    this.itineraryPointsSubject.next(points);
  }
}
