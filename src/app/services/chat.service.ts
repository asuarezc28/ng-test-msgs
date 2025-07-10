import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

export interface ChatRequest {
  query: string;
  available_pois: any[];
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
  private apiUrl2 = 'https://n8n-yfjm.onrender.com/webhook-test/lapalma-chat';

  // ReplaySubject para comunicar puntos al mapa
  private itineraryPointsSubject = new BehaviorSubject<any>(null);
  itineraryPoints$ = this.itineraryPointsSubject.asObservable();

  constructor(private http: HttpClient) {}

 // sendQuery(query: string, available_pois: any[]): Observable<ChatResponse> {
    //const body: ChatRequest = {
      //query,
      //available_pois
    //};
    //return this.http.post<ChatResponse>(this.apiUrl, body);
  //}


 sendQuery(query: string, available_pois: any[]): Observable<any> {
    const body: ChatRequest = {
      query,
      available_pois
    };
    return this.http.post<any>(this.apiUrl2, body);
  }

  // Método para emitir puntos al mapa
  emitItineraryPoints(points: any) {
    debugger;
    this.itineraryPointsSubject.next(points);
  }

  getPointsOfInterest(): Observable<any> {
    const url = 'https://geodjangov2.onrender.com/api/points-of-interest/';
    return this.http.get<any>(url);
  }
}
