import { Component, OnDestroy, OnInit, computed, effect, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { RespuestaEncuesta } from './encuestas.types';
import { EncuestasService } from './encuestas.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-encuestas',
  templateUrl: 'encuestas.html',
  styleUrl: 'encuestas.scss',
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule
  ]
})
export class Encuestas implements OnInit, OnDestroy {
  displayedColumns = ['usuarioEmail', 'juego', 'puntaje', 'fecha', 'comentario'];
  dataSource = new MatTableDataSource<RespuestaEncuesta>([]);
  cargando = signal(true);
  private sub?: Subscription;

  constructor(private encuestasSrv: EncuestasService) {}

  ngOnInit(): void {
    this.sub = this.encuestasSrv.getRespuestas$().subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.cargando.set(false);
      },
      error: () => {
        this.dataSource.data = [];
        this.cargando.set(false);
      }
    });

    this.dataSource.filterPredicate = (data: RespuestaEncuesta, filter: string) => {
      const f = filter.trim().toLowerCase();
      return (
        data.usuarioEmail.toLowerCase().includes(f) ||
        data.juego.toLowerCase().includes(f) ||
        (data.comentario ?? '').toLowerCase().includes(f) ||
        data.puntaje.toString().includes(f)
      );
    };
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  aplicarFiltro(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }
}
