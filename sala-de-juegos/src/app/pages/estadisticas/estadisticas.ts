import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { ResultsService, Resultado } from '../../services/results.service';
import { AuthService } from '../../services/auth.service';
import { EncuestasService } from '../encuestas/encuestas.service';

type ResultadoUI = {
  juego: Resultado['JUEGO'];
  puntaje: number;
  gano: boolean;
  fechaISO: string;
};

type EncuestaUI = {
  juego: string;
  puntaje: number;
  comentario: string | null;
  fechaISO: string;
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    DatePipe
  ],
  templateUrl: 'estadisticas.html',
  styleUrl: 'estadisticas.scss'
})
export class Estadisticas {
  private auth = inject(AuthService);
  private results = inject(ResultsService);
  private encuestasSrv = inject(EncuestasService);

  resultados = signal<ResultadoUI[]>([]);
  encuestas  = signal<EncuestaUI[]>([]);

  cargandoResultados = signal(true);
  cargandoEncuestas  = signal(true);
  esAdmin = toSignal(this.auth.esAdmin$, { initialValue: false });

  async ngOnInit() {
    const usuario = await this.auth.getUsuarioActual();
    if (!usuario) { this.cargandoResultados.set(false); this.cargandoEncuestas.set(false); return; }

    try {
      const rows = await this.results.listarPorUsuario(usuario.id);
      this.resultados.set(
        rows.map(r => ({
          juego: r.JUEGO,
          puntaje: r.PUNTAJE,
          gano: r.GANO,
          fechaISO: r.CREATED_AT ?? new Date().toISOString()
        }))
      );
    } finally {
      this.cargandoResultados.set(false);
    }

    try {
      const encuesta = await this.encuestasSrv.listarPorUsuario(usuario.id);
      this.encuestas.set(
        encuesta.map(e => ({
          juego: e.JUEGO,
          puntaje: e.PUNTAJE,
          comentario: e.COMENTARIO ?? null,
          fechaISO: e.FECHA ?? new Date().toISOString()
        }))
      );
    } finally {
      this.cargandoEncuestas.set(false);
    }
  }
}
