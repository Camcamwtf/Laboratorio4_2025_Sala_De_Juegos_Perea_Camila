import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule],
  template: `
  <mat-card class="game-card" [routerLink]="path">
    <div class="emoji">{{ emoji }}</div>
    <h3>{{ title }}</h3>
  </mat-card>
  `,
  styleUrl: 'game-card.scss'
})
export class GameCard {
  @Input() title = '';
  @Input() path = '/';
  @Input() emoji = '🎮';
}
