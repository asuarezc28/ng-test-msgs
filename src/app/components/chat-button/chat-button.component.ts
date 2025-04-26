import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ChatService, ChatResponse } from '../../services/chat.service';

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

  constructor(private el: ElementRef, private chatService: ChatService) {}

  ngOnInit() {
    // Posición inicial en la esquina inferior derecha
    this.position = {
      x: window.innerWidth - 100,
      y: window.innerHeight - 100
    };
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
    this.chatService.sendQuery(query).subscribe({
      next: (res: any) => {
        this.messages.push({ from: 'bot', text: res.display });
        // Emitir puntos al mapa si existen
        debugger;
        if (res.points) {
          this.chatService.emitItineraryPoints(res.points);
        }
        this.loading = false;
      },
      error: (err) => {
        this.messages.push({ from: 'bot', text: 'Ocurrió un error. Inténtalo de nuevo.' });
        this.loading = false;
      }
    });
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.loading) {
      this.sendMessage();
    }
  }
}
