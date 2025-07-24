import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ChatService, ChatResponse } from '../../services/chat.service';
import { Itinerary, ItineraryService } from '../../services/itinerary.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule],
  templateUrl: './chat-button.component.html',
  styleUrls: ['./chat-button.component.css']
})
export class ChatButtonComponent implements OnInit {
  isDragging = false;
  position = { x: 20, y: 20 };
  dragOffset = { x: 0, y: 0 };
  showChat = false;

  messages: ChatMessage[] = [];
  userInput: string = '';
  loading: boolean = false;

  pois: any[] = [];
  filteredPois: any[] = [];

  constructor(private el: ElementRef, private chatService: ChatService, private itineraryService: ItineraryService) {}

  ngOnInit() {
    console.log('ngOnInit');
    // Posición inicial en la esquina inferior derecha
    this.position = {
      x: window.innerWidth - 100,
      y: window.innerHeight - 100
    };

    // Cargar POIs reales desde el backend
    this.chatService.getPointsOfInterest().subscribe({
      next: (res) => {
        // El endpoint devuelve un FeatureCollection, así que extraemos los features
        this.pois = (res.results && res.results.features)
          ? res.results.features.map((f: any) => ({
              id: f.id,
              name: f.properties.name,
              description: f.properties.description,
              type: f.properties.type,
              difficulty: f.properties.difficulty
            }))
          : [];
        console.log('POIs cargados:', this.pois);
      },
      error: (err) => {
        console.error('Error cargando POIs', err);
        this.pois = [];
      }
    });
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.target instanceof HTMLElement && event.target.closest('.chat-button')) {
      this.isDragging = true;
      this.dragOffset = {
        x: event.clientX - this.position.x,
        y: event.clientY - this.position.y
      };
      event.preventDefault();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.position = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y
      };
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  toggleChat() {
    if (!this.isDragging) {
      this.showChat = !this.showChat;
    }
  }

  sendMessage() {
    const query = this.userInput.trim();
    if (!query) return;
    this.messages.push({ from: 'user', text: query });
    this.userInput = '';
    this.loading = true;
    console.log('POIs!!!!!!!!!:', this.pois);
    this.chatService.sendQuery(query, this.pois).subscribe({
      next: (res: any) => {
        console.log('RES:!!!!!!!!!!!!', res);
        if (res.points){
        const test = this.mapToOriginalStructure(res);
        console.log('TEST:!!!!!!!!!!!!', test);
        this.itineraryService.setCurrentItinerary(test as unknown as Itinerary);
        }
       // console.log('TEST:!!!!!!!!!!!!', test);
     this.messages.push({ from: 'bot', text: res.text });
       // this.messages.push({ from: 'bot', text: res.display });
        // Emitir el itinerario al Sidebar
        // console.log('RES DATA:', res.data);
        //const test = this.buildFullItinerary(res.data);
        //console.log('TEST:', test);
        //if (res.data) {
          //this.itineraryService.setCurrentItinerary(test as Itinerary);
        //}
        //this.loading = false;
      },
      error: (err) => {
        this.messages.push({ from: 'bot', text: 'Ocurrió un error. Inténtalo de nuevo.' });
        this.loading = false;
      }
    });
  }

 mapToOriginalStructure(data: { title: string; points: any[] }) {
  const result = {
    display: "Tu itinerario ya está disponible en el mapa",
    data: {
      title: data.title,
      description: `Una ruta para descubrir La Palma en ${new Set(data.points.map(p => p.day)).size} días.`,
      points: data.points.map((p, index): any => ({
        id: index + 1,
        day: p.day,
        order: p.order,
        notes: "", // puedes rellenarlo con lógica si quieres
        point_details: {
          name: p.name,
          description: p.desc,
          type: "PLACE", // o intenta inferirlo si tienes más datos
          estimated_time: p.time,
          coordinates: p.coords
        }
      }))
    }
  };

  return result;
}




   buildFullItinerary(compactData: any) {
  const now = new Date().toISOString();

  return {
    id: 1,
    title: compactData.title,
    description: compactData.description,
    start_date: "2024-03-15T00:00:00.000Z", // Puedes parametrizar estas fechas
    end_date: "2024-03-16T00:00:00.000Z",
    user: null,
    points: compactData.points.map((p: { id: any; day: any; order: any; notes: any; point_details: { name: any; description: any; coordinates: any; type: any; estimated_time: string; }; }) => ({
      id: p.id,
      day: p.day,
      order: p.order,
      notes: p.notes,
      point_details: {
        id: p.id,
        name: p.point_details.name,
        description: p.point_details.description,
        location: {
          type: "Point",
          coordinates: p.point_details.coordinates
        },
        address: "", // Puedes agregar si tienes info extra
        type: p.point_details.type,
        difficulty: "EASY", // O asigna según tu lógica
        estimated_time: p.point_details.estimated_time + ":00", // Añadimos segundos
        created_at: now,
        updated_at: now
      },
      point_of_interest: p.id,
      restaurant: null,
      event: null
    })),
    created_at: now,
    updated_at: now
  };
}


  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.loading) {
      this.sendMessage();
    }
  }
}
