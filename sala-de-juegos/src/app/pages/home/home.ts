import { RouterModule } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { GameCard } from '../../shared/game-card/game-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    AsyncPipe,
    GameCard
  ],
  templateUrl: 'home.html',
  styleUrl: 'home.scss'
})
export class Home {
  auth = inject(AuthService);
  usuario$ = this.auth.miUsuario$;

  juegos = [
    { title:'Ahorcado',     path:'/ahorcado',     emoji:'🪓' },
    { title:'Mayor/Menor',  path:'/mayor-menor',  emoji:'🔼🔽' },
    { title:'Preguntados',  path:'/preguntados',  emoji:'❓' },
    { title:'Arkanoid',     path:'/arkanoid',     emoji:'🕹️' }
  ];
}
