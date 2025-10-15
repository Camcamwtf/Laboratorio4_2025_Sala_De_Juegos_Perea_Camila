import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: 'quien-soy.html',
  styleUrl: 'quien-soy.scss'
})
export class QuienSoy {}
