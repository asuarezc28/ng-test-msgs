import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './chat-button.component.html',
  styleUrls: ['./chat-button.component.css']
})
export class ChatButtonComponent implements OnInit {
  isDragging = false;
  position = { x: 20, y: 20 };
  dragOffset = { x: 0, y: 0 };
  showChat = false;

  constructor(private el: ElementRef) {}

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
}
