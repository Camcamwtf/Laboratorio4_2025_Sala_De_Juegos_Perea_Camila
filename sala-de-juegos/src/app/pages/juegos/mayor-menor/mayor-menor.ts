import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ResultsService } from '../../../services/results.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

function draw(){ return Math.floor(Math.random()*13)+1; }

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: 'mayor-menor.html',
  styleUrl: 'mayor-menor.scss'
})
export class MayorMenor {
  private results = inject(ResultsService);
  private auth = inject(AuthService);

  partidaIniciada = signal(false); 
  cartaActual = signal(draw());
  puntaje = signal(0);

  seleccionarOpcion(sign: '>'|'<') {
    const next = draw();
    const ok = (sign==='>' && next>this.cartaActual()) || (sign==='<' && next<this.cartaActual());
    this.puntaje.update(s => ok ? s + 1 : Math.max(0, s - 0));
    this.cartaActual.set(next);
    this.partidaIniciada.set(true);
  }

  reiniciarJuego() {
    this.puntaje.set(0);
    this.cartaActual.set(draw());
    this.partidaIniciada.set(false);
  }

  async guardarJuego() {
    if (!this.partidaIniciada()) return;

    const usuario = await this.auth.getUsuarioActual();
    if (!usuario) return;

    try {
      await this.results.guardarResultado({
        ID_USUARIO: usuario.id,
        JUEGO: 'Mayor/Menor',
        PUNTAJE: this.puntaje(),
        TIEMPO_PARTIDA: 0,
        GANO: true
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
