import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/auth.service';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgIf, AsyncPipe],
  template: './home.html',
  styles: [`
    .wrap { padding: 16px; display: grid; gap: 16px; }
    mat-card { padding: 16px; }
  `]
})
export class Home {
  auth = inject(AuthService);
}
