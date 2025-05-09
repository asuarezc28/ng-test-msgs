import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarService } from '../../services/sidebar.service';
import { ItineraryService, Itinerary, Point } from '../../services/itinerary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarModule, PanelModule, AccordionModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  sidebarVisible = false;
  showItineraryDetail = false;
  selectedItinerary: Itinerary | null = null;
  itineraries: Itinerary[] = [];
  isFromGPT = false;
  loadingItineraries = false;
  private subscription: Subscription;
  private itinerarySubscription: Subscription;

  constructor(
    private sidebarService: SidebarService,
    private itineraryService: ItineraryService
  ) {
    this.subscription = this.sidebarService.sidebarVisible$.subscribe(
      visible => this.sidebarVisible = visible
    );

    this.itinerarySubscription = this.itineraryService.currentItinerary$.subscribe(
      ({itinerary, isFromGPT}) => {
        if (itinerary) {
          this.selectedItinerary = itinerary;
          this.isFromGPT = isFromGPT;
          this.showItineraryDetail = true;
        }
      }
    );
  }

  ngOnInit() {
    this.loadItineraries();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.itinerarySubscription) {
      this.itinerarySubscription.unsubscribe();
    }
  }

  loadItineraries() {
    this.loadingItineraries = true;
    this.itineraryService.getAllItineraries().subscribe({
      next: (data: Itinerary[]) => {
        console.log('Itineraries loaded:', data);
        this.itineraries = data;
        this.loadingItineraries = false;
      },
      error: (error: any) => {
        console.error('Error loading itineraries:', error);
        this.loadingItineraries = false;
      }
    });
  }

  onSidebarHide() {
    this.sidebarService.setSidebarVisible(false);
    this.showItineraryDetail = false;
    this.selectedItinerary = null;
  }
  


  selectItinerary(itinerary: Itinerary, fromGPT: boolean = false) {
    this.selectedItinerary = itinerary;
    this.showItineraryDetail = true;
    this.isFromGPT = fromGPT;
  }

  backToList() {
    this.showItineraryDetail = false;
    this.selectedItinerary = null;
    this.itineraryService.setCurrentItinerary(null as any, false);
    this.loadItineraries();
  }

  getDays(itinerary: Itinerary): number[] {
    const days = new Set<number>();
    itinerary.points.forEach(point => days.add(point.day));
    return Array.from(days).sort((a, b) => a - b);
  }

  getPointsForDay(itinerary: Itinerary, day: number): Point[] {
    return itinerary.points
      .filter(point => point.day === day)
      .sort((a, b) => a.order - b.order);
  }

  saveItinerary() {
    if (this.selectedItinerary) {
      // Crear un nuevo objeto sin los campos que no queremos enviar
      const { id, created_at, updated_at, ...itineraryWithoutMetadata } = this.selectedItinerary;
      
      // Asegurarnos de que las fechas estén en el formato correcto
      const itineraryToSave = {
        ...itineraryWithoutMetadata,
        start_date: this.selectedItinerary.start_date instanceof Date 
          ? this.selectedItinerary.start_date.toISOString() 
          : this.selectedItinerary.start_date,
        end_date: this.selectedItinerary.end_date instanceof Date 
          ? this.selectedItinerary.end_date.toISOString() 
          : this.selectedItinerary.end_date
      };

      this.itineraryService.createItinerary(itineraryToSave).subscribe({
        next: (savedItinerary) => {
          console.log('Itinerario guardado:', savedItinerary);
          // Actualizar la lista de itinerarios
          this.loadItineraries();
          // Desactivar el modo GPT
          this.isFromGPT = false;
          // Mostrar mensaje de éxito (podemos implementar un toast o mensaje más adelante)
          alert('Itinerario guardado con éxito');
        },
        error: (error) => {
          console.error('Error al guardar el itinerario:', error);
          alert('Error al guardar el itinerario');
        }
      });
    }
  }
} 