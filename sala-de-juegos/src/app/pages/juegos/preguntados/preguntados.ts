import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ResultsService } from '../../../services/results.service';
import { AuthService } from '../../../services/auth.service';
import { BanderasService, PreguntaBandera } from '../../../services/banderas.service'
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [ CommonModule, MatCardModule, MatButtonModule ],
  templateUrl: 'preguntados.html',
  styleUrl: 'preguntados.scss'
})
export class Preguntados {
  private results = inject(ResultsService);
  private auth    = inject(AuthService);

  private banderas = inject(BanderasService);
  preguntas: PreguntaBandera[] = this.banderas.getPreguntasRandom(10);

  index = signal(0);
  respuestaCorrecta = signal(0);
  partidaIniciada = signal(false);
  finalizado = computed(() => this.index() >= this.preguntas.length);
  puntaje = computed(() => this.respuestaCorrecta() * 10);

  total = computed(() => this.preguntas.length);
  minParaGanar = computed(() => Math.max(1, Math.ceil(this.total() / 2)));
  gano = computed(() => this.respuestaCorrecta() >= this.minParaGanar());
  perdio = computed(() => this.finalizado() && this.respuestaCorrecta() < this.minParaGanar());

  seleccionarOpcion(code: string) {
    if (this.finalizado()) return;
    this.partidaIniciada.set(true);
    const p = this.preguntas[this.index()];
    if (!p) return;
    if (code === p.correctaCode) {
      this.respuestaCorrecta.update(v => v + 1);
    }
    this.index.update(v => v + 1);
  }

  reiniciarJuego() {
    this.index.set(0);
    this.respuestaCorrecta.set(0);
    this.partidaIniciada.set(false);
    this.preguntas = this.banderas.getPreguntasRandom(10);
  }

  async guardarJuego() {
    if (!this.partidaIniciada()) return;

    const usuario = await this.auth.getUsuarioActual?.() || await this.auth.getUsuarioActual();
    if (!usuario) return;

    try {
      await this.results.guardarResultado({
        ID_USUARIO: usuario.id,
        JUEGO: 'Preguntados',
        PUNTAJE: this.puntaje(),
        TIEMPO_PARTIDA: 0,
        GANO: this.gano()
      });

      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Sus resultados han sido guardados con éxito.',
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        },
        buttonsStyling: false
      });
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar los resultados',
        text: 'Por favor, intente nuevamente.',
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        },
        buttonsStyling: false
      });
    }
  }
}
