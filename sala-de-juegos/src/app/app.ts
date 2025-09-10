import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, NgIf, AsyncPipe],
  templateUrl: './app.html',
  styles: [`
    .spacer { flex: 1 1 auto; }
    mat-toolbar {
      background-color: var(--ion-color-primary);
      color: var(--texto-principal);
    }
    a[mat-button], button[mat-button] {
      color: var(--ion-color-dark);
      font-weight: 500;
    }
    a[mat-button]:hover, button[mat-button]:hover {
      background-color: var(--ion-color-secondary);
      color: var(--ion-color-light);
    }
  `]
})
export class App {
  auth = inject(AuthService);
  logout() { this.auth.logout(); }
}
