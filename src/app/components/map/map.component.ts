import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ItineraryService, Itinerary, Point } from '../../services/itinerary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markerLayers: L.LayerGroup[] = [];
  private selectedItinerary: Itinerary | null = null;
  private subscription: Subscription;

  // Definir colores para cada día
  private dayColors = [
    '#FF5733', // Día 1: Naranja
    '#33FF57', // Día 2: Verde
    '#3357FF', // Día 3: Azul
    '#FF33F5', // Día 4: Rosa
    '#33FFF5'  // Día 5: Cyan
  ];

  // Iconos según el tipo de punto
  private typeIcons = {
    PARK: 'tree',
    RESTAURANT: 'utensils',
    MUSEUM: 'landmark',
    BEACH: 'umbrella-beach',
    VIEWPOINT: 'mountain',
    DEFAULT: 'map-marker'
  };

  constructor(private itineraryService: ItineraryService) {
    this.subscription = this.itineraryService.currentItinerary$.subscribe(itinerary => {
      console.log('Received itinerary in subscription:', itinerary);
      if (itinerary && this.map) {
        this.displayItinerary(itinerary);
      }
    });
  }

  ngOnInit() {
    console.log('MapComponent initialized');
  }

  ngAfterViewInit() {
    console.log('Initializing map');
    this.initMap();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private initMap() {
    try {
      this.map = L.map('map').setView([28.7, -17.8], 11);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  public displayItinerary(itinerary: Itinerary) {
    console.log('Displaying itinerary:', itinerary);
    if (!this.map) {
      console.error('Map not initialized!');
      return;
    }

    this.clearMap();
    this.selectedItinerary = itinerary;
    
    if (!itinerary.points || itinerary.points.length === 0) {
      console.warn('No points in itinerary!');
      return;
    }

    // Agrupar puntos por día
    const pointsByDay = this.groupPointsByDay(itinerary.points);
    console.log('Points grouped by day:', pointsByDay);
    
    // Crear marcadores para cada día
    pointsByDay.forEach((points, dayIndex) => {
      console.log(`Creating markers for day ${dayIndex + 1}:`, points);
      this.createDayMarkers(points, dayIndex);
    });

    // Ajustar el zoom para ver todos los puntos
    this.fitMapToBounds();
  }

  private groupPointsByDay(points: Point[]): Point[][] {
    const days = new Set(points.map(point => point.day));
    return Array.from(days)
      .sort((a, b) => a - b)
      .map(day => 
        points
          .filter(point => point.day === day)
          .sort((a, b) => a.order - b.order)
      );
  }

  private createDayMarkers(points: Point[], dayIndex: number) {
    console.log(`Creating markers for day ${dayIndex + 1}:`, points);
    const layerGroup = L.layerGroup();
    
    points.forEach(point => {
      const coords = point.point_details.location.coordinates;
      const latLng: [number, number] = [coords[1], coords[0]];
      console.log(`Creating marker for point "${point.point_details.name}" at coords:`, latLng);
      
      try {
        const marker = this.createMarker(latLng, point, this.dayColors[dayIndex % this.dayColors.length]);
        layerGroup.addLayer(marker);
        console.log('Marker created successfully');
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });

    this.markerLayers.push(layerGroup);
    layerGroup.addTo(this.map);
    console.log(`Added layer group for day ${dayIndex + 1} to map`);
  }

  private createMarker(coords: [number, number], point: Point, color: string): L.Marker {
    console.log('Creating marker with:', { coords, pointName: point.point_details.name, color });
    
    const icon = this.createCustomIcon(point.point_details.type, color);
    const marker = L.marker(coords, { icon });
    
    const popupContent = this.createPopupContent(point);
    marker.bindPopup(popupContent);
    
    const tooltipContent = `
      <div class="marker-tooltip">
        <strong>${point.point_details.name}</strong>
        <br>
        Día ${point.day} - Parada ${point.order}
        <br>
        <small>${point.point_details.description}</small>
      </div>
    `;
    marker.bindTooltip(tooltipContent, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip'
    });

    return marker;
  }

  private createCustomIcon(type: string, color: string): L.DivIcon {
    const iconType = this.typeIcons[type as keyof typeof this.typeIcons] || this.typeIcons.DEFAULT;
    
    return L.divIcon({
      html: `
        <div class="custom-marker" style="background-color: ${color}">
          <i class="fas fa-${iconType}"></i>
          <div class="marker-pulse"></div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  }

  private createPopupContent(point: Point): string {
    return `
      <div class="popup-content">
        <h3>${point.point_details.name}</h3>
        <p><strong>Descripción:</strong> ${point.point_details.description}</p>
        <p><strong>Notas:</strong> ${point.notes || 'No hay notas'}</p>
        <p><strong>Dirección:</strong> ${point.point_details.address}</p>
        <p><strong>Tiempo estimado:</strong> ${point.point_details.estimated_time}</p>
        <p><strong>Dificultad:</strong> ${point.point_details.difficulty}</p>
        <p><strong>Tipo:</strong> ${point.point_details.type}</p>
      </div>
    `;
  }

  private clearMap() {
    // Limpiar marcadores anteriores
    this.markerLayers.forEach(layer => {
      layer.clearLayers();
      this.map.removeLayer(layer);
    });
    this.markerLayers = [];
  }

  private fitMapToBounds() {
    if (!this.selectedItinerary) return;

    const bounds = L.latLngBounds(
      this.selectedItinerary.points.map(point => {
        const coords = point.point_details.location.coordinates;
        return [coords[1], coords[0]];
      })
    );

    this.map.fitBounds(bounds, {
      padding: [50, 50]
    });
  }
} 