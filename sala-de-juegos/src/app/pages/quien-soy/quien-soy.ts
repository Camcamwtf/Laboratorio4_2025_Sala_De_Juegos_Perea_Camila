// src/app/pages/quien-soy/quien-soy.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: '',
  styles: [`
    .wrap { padding: 16px; display: grid; place-items: center; }
    .card { display: grid; grid-template-columns: 120px 1fr; gap: 16px; padding: 16px; max-width: 720px; width: 100%; }
    .avatar { width: 120px; height: 120px; object-fit: cover; border-radius: 12px; }
    h2 { margin: 0 0 8px; }
  `]
})
export class QuienSoy {}
