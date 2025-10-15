import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ResultsService } from '../../../services/results.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

const PALABRAS = [ 'ARCADE', 'JUEGOS', 'ESTRATEGIA', 'RETRO', 'MOVILIDAD', 'DIVERSION' ];

@Component({
  selector: '',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: 'ahorcado.html',
  styleUrl: 'ahorcado.scss'
})
export class Ahorcado {
  private results = inject(ResultsService);
  private auth = inject(AuthService);

  readonly abecedario = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  letrasUsadas = new Set<string>();
  letrasOK = new Set<string>();
  letrasFALLIDAS = new Set<string>();

  partidaIniciada = signal(false); 
  palabraCorrecta = signal(PALABRAS[Math.floor(Math.random()*PALABRAS.length)]);
  letraUsada = signal<string[]>([]);
  errores = signal(0);
  maximoErrores = 5;

  masked = computed(() =>
    this.palabraCorrecta().split('').map(ch => this.letraUsada().includes(ch) ? ch : '_').join(' ')
  );

  get estadoJuego(): 'jugando' | 'gano' | 'perdio' {
    if (!this.masked().includes('_')) return 'gano';
    if (this.errores() >= this.maximoErrores) return 'perdio';
    return 'jugando';
  }

  private calcularPuntaje(): number {
    const vidasRestantes = this.maximoErrores - this.errores();
    return Math.max(0, Math.round((vidasRestantes * 100) / this.maximoErrores));
  }

  acertarLetra(letra: string) {
    if (this.letrasUsadas.has(letra) || this.estadoJuego !== 'jugando') return;
    
    this.partidaIniciada.set(true);
    this.letrasUsadas.add(letra);

    const acierto = this.palabraCorrecta().includes(letra);
    if (acierto) {
      this.letrasOK.add(letra);
      this.letraUsada.update(u => [...u, letra]);
    } else {
      this.letrasFALLIDAS.add(letra);
      if (!this.palabraCorrecta().includes(letra)) this.errores.update(f => f+1);
    }
  }

  reiniciarJuego() {
    this.palabraCorrecta.set(PALABRAS[Math.floor(Math.random()*PALABRAS.length)]);
    this.letraUsada.set([]); this.errores.set(0);
    this.partidaIniciada.set(false);

    this.letrasUsadas.clear();
    this.letrasOK.clear();
    this.letrasFALLIDAS.clear();
  }

  async guardarJuego() {
    if (!this.partidaIniciada()) return;

    const usuario = await this.auth.getUsuarioActual();
    if (!usuario) return;

    const puntaje = this.calcularPuntaje();

    try {
      await this.results.guardarResultado({
        ID_USUARIO: usuario.id,
        JUEGO: 'Ahorcado',
        PUNTAJE: puntaje,
        TIEMPO_PARTIDA: 0,
        GANO: this.estadoJuego === 'gano'
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
