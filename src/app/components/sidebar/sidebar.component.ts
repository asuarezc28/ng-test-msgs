import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { SidebarService } from '../../services/sidebar.service';
import { ItineraryService, Itinerary, Point } from '../../services/itinerary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarModule, PanelModule, AccordionModule, ButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  sidebarVisible = false;
  showItineraryDetail = false;
  selectedItinerary: Itinerary | null = null;
  itineraries: Itinerary[] = [];
  private subscription: Subscription;

  constructor(
    private sidebarService: SidebarService,
    private itineraryService: ItineraryService
  ) {
    this.subscription = this.sidebarService.sidebarVisible$.subscribe(
      visible => this.sidebarVisible = visible
    );
  }

  ngOnInit() {
    this.loadItineraries();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadItineraries() {
    this.itineraryService.getAllItineraries().subscribe({
      next: (data: Itinerary[]) => {
        console.log('Itineraries loaded:', data);
        this.itineraries = data;
      },
      error: (error: any) => {
        console.error('Error loading itineraries:', error);
      }
    });
  }

  onSidebarHide() {
    this.sidebarService.setSidebarVisible(false);
    this.showItineraryDetail = false;
    this.selectedItinerary = null;
  }

  selectItinerary(itinerary: Itinerary) {
    this.selectedItinerary = itinerary;
    this.showItineraryDetail = true;
    this.itineraryService.setCurrentItinerary(itinerary);
  }

  backToList() {
    this.showItineraryDetail = false;
    this.selectedItinerary = null;
    this.itineraryService.setCurrentItinerary(null);
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
} 