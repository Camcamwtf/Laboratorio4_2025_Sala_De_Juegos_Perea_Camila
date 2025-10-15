import { Component, ElementRef, ViewChild, OnDestroy, AfterViewInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ResultsService } from '../../../services/results.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

type GameState = 'jugando' | 'pausa' | 'nivel-ok' | 'gano' | 'perdio';

@Component({
  standalone: true,
  selector: 'arkanoid',
  imports: [ CommonModule, MatCardModule, MatButtonModule ],
  templateUrl: 'arkanoid.html',
  styleUrl: 'arkanoid.scss'
})
export class Arkanoid implements AfterViewInit, OnDestroy {
  @ViewChild('game', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private results = inject(ResultsService);
  private auth    = inject(AuthService);

  partidaIniciada = signal(false);
  puntaje = signal(0);
  nivel   = signal(1);
  vidas   = signal(3);
  estado = signal<GameState>('jugando');
  pausado = computed(() => this.estado() === 'pausa');
  overlayText = computed(() => {
    switch (this.estado()) {
      case 'pausa':     return 'PAUSA';
      case 'nivel-ok':  return '¡Nivel superado!';
      case 'perdio':    return '¡GAME OVER!';
      case 'gano':      return '¡GANASTE!';
      default:          return '';
    }
  });

  private tiempoInicial = 0;
  private tiempoFinal  = 0;
  private rafId   = 0;
  private W = 640;
  private H = 480;

  private paddle = { w: 100, h: 12, x: 270, y: 440, speed: 6, moveLeft: false, moveRight: false };
  private ball = { r: 6, x: 320, y: 320, vx: 4, vy: -4, speedMax: 8 };

  private cols = 10;
  private rows = 6;
  private brickW = 58;
  private brickH = 18;
  private brickGap = 4;
  private bricks: { x:number; y:number; hp:number }[] = [];
  private dragging = false;

  private readonly MAX_NIVELES = 5;

  private color = {
    bg1: '#0c1224',
    grid: 'rgba(120,160,255,.08)',
    paddle: '#6EA8FE',
    ball: '#8A8DFF',
    brick1: '#2AAFA2',
    brick2: '#6EA8FE',
    brick3: '#8A8DFF',
    text: '#EAF2FF'
  };

  private get runningLoop() { return this.rafId !== 0; }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.modificarTamanioCanvas();

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    this.iniciarNivel();
    this.bindEvents();
    this.empezarJuego();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.unbindEvents();
  }

  private empezarJuego() {
    this.partidaIniciada.set(true);
    this.estado.set('jugando');

    this.tiempoInicial = performance.now();
    this.tiempoFinal  = this.tiempoInicial;

    const loop = (t: number) => {
      this.rafId = requestAnimationFrame(loop);
      if (this.pausado() || this.estado() === 'nivel-ok' || this.estado() === 'gano' || this.estado() === 'perdio') {
        this.dibujarPantalla();
        return;
      }

      const dt = Math.min(32, t - this.tiempoFinal);
      this.tiempoFinal = t;
      this.actualizarMovimientoJuego(dt / 16.67);
      this.dibujarPantalla();
    };
    this.rafId = requestAnimationFrame(loop);
  }

  pauseToggle() {
    if (this.estado() === 'jugando') this.estado.set('pausa');
    else if (this.estado() === 'pausa') this.estado.set('jugando');
  }

  reiniciarJuego() {
    this.puntaje.set(0);
    this.nivel.set(1);
    this.vidas.set(3);
    this.rows = 6;
    this.reiniciarPosicionPelota(true);
    this.iniciarNivel();
    this.estado.set('jugando');
    this.partidaIniciada.set(false);
    this.tiempoInicial = performance.now();
    if (!this.runningLoop) this.empezarJuego();
  }

  private iniciarNivel() {
    this.bricks = [];
    const offsetX = (this.W - (this.cols*this.brickW + (this.cols-1)*this.brickGap)) / 2;
    const offsetY = 70;

    for (let r=0; r<this.rows; r++) {
      for (let c=0; c<this.cols; c++) {
        const x = offsetX + c*(this.brickW + this.brickGap);
        const y = offsetY + r*(this.brickH + this.brickGap);
        const hp = 1 + Math.floor(r/2);
        this.bricks.push({ x, y, hp });
      }
    }
  }

  private cargarSiguienteNivel() {
    if (this.nivel() >= this.MAX_NIVELES) {
      this.finalizarJuego(true);
      return;
    }

    this.estado.set('nivel-ok');
    setTimeout(() => {
      this.nivel.update(n => n+1);
      this.ball.vx *= 1.1;
      this.ball.vy *= 1.1;
      this.paddle.speed *= 1.05;
      this.rows = Math.min(8, this.rows + 1);
      this.iniciarNivel();
      this.reiniciarPosicionPelota(false);
      this.estado.set('jugando');
    }, 900);
  }

  private reiniciarPosicionPelota(centerBall = false) {
    this.paddle.w = Math.max(70, 100 - (this.nivel()-1)*4);
    this.paddle.x = (this.W - this.paddle.w)/2;
    this.paddle.y = this.H - 40;

    if (centerBall) {
      this.ball.x = this.W/2; this.ball.y = this.H/2;
    } else {
      this.ball.x = this.W/2; this.ball.y = this.H - 60;
    }
    const speed = Math.min(this.ball.speedMax, 4 + (this.nivel()-1)*0.8);
    const angle = (-Math.PI/3) + Math.random()*Math.PI/6;
    this.ball.vx = speed * Math.cos(angle);
    this.ball.vy = speed * Math.sin(angle);
  }

  private actualizarMovimientoJuego(k: number) {
    if (this.paddle.moveLeft)  this.paddle.x -= this.paddle.speed * k;
    if (this.paddle.moveRight) this.paddle.x += this.paddle.speed * k;
    this.paddle.x = Math.max(0, Math.min(this.W - this.paddle.w, this.paddle.x));

    this.ball.x += this.ball.vx * k;
    this.ball.y += this.ball.vy * k;

    if (this.ball.x < this.ball.r) { this.ball.x = this.ball.r; this.ball.vx *= -1; }
    if (this.ball.x > this.W - this.ball.r) { this.ball.x = this.W - this.ball.r; this.ball.vx *= -1; }
    if (this.ball.y < this.ball.r) { this.ball.y = this.ball.r; this.ball.vy *= -1; }

    if (this.ball.y + this.ball.r >= this.paddle.y &&
        this.ball.y - this.ball.r <= this.paddle.y + this.paddle.h &&
        this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + this.paddle.w) {

      this.ball.y = this.paddle.y - this.ball.r;
      this.ball.vy *= -1;

      const hit = (this.ball.x - (this.paddle.x + this.paddle.w/2)) / (this.paddle.w/2);
      this.ball.vx += hit * 1.8;
      const sp = Math.hypot(this.ball.vx, this.ball.vy);
      const max = this.ball.speedMax + this.nivel()*0.6;
      if (sp > max) { this.ball.vx *= max/sp; this.ball.vy *= max/sp; }
    }

    if (this.ball.y - this.ball.r > this.H) {
      this.vidas.update(l => l-1);
      if (this.vidas() <= 0) {
        this.finalizarJuego(false);
        return;
      }
      this.reiniciarPosicionPelota(false);
    }

    for (const b of this.bricks) {
      if (b.hp <= 0) continue;
      const bx = b.x, by = b.y, bw = this.brickW, bh = this.brickH;
      if (this.ball.x + this.ball.r > bx && this.ball.x - this.ball.r < bx + bw &&
          this.ball.y + this.ball.r > by && this.ball.y - this.ball.r < by + bh) {
        const overlapX = Math.min(this.ball.x + this.ball.r - bx, (bx + bw) - (this.ball.x - this.ball.r));
        const overlapY = Math.min(this.ball.y + this.ball.r - by, (by + bh) - (this.ball.y - this.ball.r));
        if (overlapX < overlapY) this.ball.vx *= -1; else this.ball.vy *= -1;

        b.hp -= 1;
        this.puntaje.update(s => s + 10);
        break;
      }
    }

    if (this.bricks.every(b => b.hp <= 0)) {
      this.puntaje.update(s => s + 100);
      this.cargarSiguienteNivel();
    }
  }

  private dibujarPantalla() {
    const c = this.ctx;
    c.clearRect(0,0,this.W,this.H);

    c.fillStyle = this.color.bg1; c.fillRect(0,0,this.W,this.H);
    c.strokeStyle = this.color.grid; c.lineWidth = 1;
    for (let x=0; x<this.W; x+=32) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,this.H); c.stroke(); }
    for (let y=0; y<this.H; y+=32) { c.beginPath(); c.moveTo(0,y); c.lineTo(this.W,y); c.stroke(); }

    c.fillStyle = this.color.paddle;
    c.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);

    c.fillStyle = this.color.ball;
    c.beginPath(); c.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI*2); c.fill();

    for (const b of this.bricks) {
      if (b.hp <= 0) continue;
      c.fillStyle = b.hp === 1 ? this.color.brick1 : b.hp === 2 ? this.color.brick2 : this.color.brick3;
      c.fillRect(b.x, b.y, this.brickW, this.brickH);
    }

    const text = this.overlayText();
    if (text) {
      c.fillStyle = 'rgba(0,0,0,.45)';
      c.fillRect(0,0,this.W,this.H);
      c.fillStyle = '#EAF2FF';
      c.font = 'bold 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      const m = c.measureText(text);
      c.fillText(text, (this.W - m.width)/2, this.H/2);
    }
  }

  private keyDown = (e: KeyboardEvent) => {
    if (this.estado() === 'gano' || this.estado() === 'perdio') return;
    if (e.key === 'ArrowLeft') this.paddle.moveLeft = true;
    if (e.key === 'ArrowRight') this.paddle.moveRight = true;
    if (e.key.toLowerCase() === 'p') this.pauseToggle();
  };

  private keyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') this.paddle.moveLeft = false;
    if (e.key === 'ArrowRight') this.paddle.moveRight = false;
  };

  private touchStart = (e: TouchEvent) => { this.dragging = true; this.touchMove(e); };

  private touchMove  = (e: TouchEvent) => {
    if (!this.dragging) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const scale = this.W / rect.width;
    const worldX = x * scale;
    this.paddle.x = Math.max(0, Math.min(this.W - this.paddle.w, worldX - this.paddle.w/2));
  };

  private touchEnd = () => { this.dragging = false; };

  private resize = () => this.modificarTamanioCanvas();

  private bindEvents() {
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    const c = this.canvasRef.nativeElement;
    c.addEventListener('touchstart', this.touchStart, { passive: true });
    c.addEventListener('touchmove',  this.touchMove,  { passive: true });
    c.addEventListener('touchend',   this.touchEnd);
    window.addEventListener('resize', this.resize);
  }

  private unbindEvents() {
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
    const c = this.canvasRef.nativeElement;
    c.removeEventListener('touchstart', this.touchStart);
    c.removeEventListener('touchmove',  this.touchMove);
    c.removeEventListener('touchend',   this.touchEnd);
    window.removeEventListener('resize', this.resize);
  }

  private modificarTamanioCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const maxW = Math.min(parent.clientWidth - 4, 960);
    const targetW = Math.max(320, Math.floor(maxW));
    const targetH = Math.floor(targetW * 3 / 4);

    this.W = targetW; this.H = targetH;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width  = Math.floor(this.W * dpr);
    canvas.height = Math.floor(this.H * dpr);
    canvas.style.width  = `${this.W}px`;
    canvas.style.height = `${this.H}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    this.paddle.y = this.H - 40;
  }

  private async finalizarJuego(gano: boolean) {
    this.estado.set(gano ? 'gano' : 'perdio');
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  async guardarJuego(gano: boolean) {
    if (!this.partidaIniciada()) return;

    const usuario = await this.auth.getUsuarioActual();
    if (!usuario) return;

    const tiempoPartida = Math.round(performance.now() - this.tiempoInicial);

    try {
      await this.results.guardarResultado({
        ID_USUARIO: usuario.id,
        JUEGO: 'Arkanoid',
        PUNTAJE: this.puntaje(),
        TIEMPO_PARTIDA: tiempoPartida,
        GANO: gano
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
