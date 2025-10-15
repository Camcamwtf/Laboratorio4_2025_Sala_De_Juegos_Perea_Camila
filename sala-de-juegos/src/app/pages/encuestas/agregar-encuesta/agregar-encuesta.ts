import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TextFieldModule } from '@angular/cdk/text-field';
import { EncuestasService } from '../encuestas.service';
import { AuthService } from '../../../services/auth.service';
import { JUEGOS } from '../encuestas.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-encuesta',
  standalone: true,
  templateUrl: 'agregar-encuesta.html',
  styleUrls: ['agregar-encuesta.scss'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    TextFieldModule
  ]
})
export class AgregarEncuesta implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private encuestasService = inject(EncuestasService);
  
  agregarEncuestaForm!: FormGroup;
  juegos = JUEGOS;
  estrellas = [1,2,3,4,5];
  submitted = false;

  get f() { return this.agregarEncuestaForm.controls; }

  ngOnInit(){
    this.agregarEncuestaForm = this.fb.group({
      JUEGO: ['', [Validators.required]],
      PUNTAJE: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      COMENTARIO: ['']
    }, { updateOn: 'blur' });
  }

  setPuntaje(v: number) {
    this.agregarEncuestaForm.patchValue({ PUNTAJE: v }, { emitEvent: false });
    const c = this.f['PUNTAJE'];
    c.markAsTouched();
    c.markAsDirty();
    c.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  esEstrellaMarcada(i: number): boolean {
    return (this.agregarEncuestaForm.value.PUNTAJE ?? 0) >= i;
  }

  async onSubmit() {
    this.submitted = true;

    this.agregarEncuestaForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });

    if (this.agregarEncuestaForm.invalid) {
      this.agregarEncuestaForm.markAllAsTouched();
      return;
    }
    const user = await this.auth.getUsuarioActual();
    if (!user) {
      Swal.fire({
        title: 'Sesión requerida',
        text: 'Debes iniciar sesión para enviar la encuesta.',
        icon: 'warning',
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        }
      });
      return;
    }

    try {
      await this.encuestasService.crearEncuesta({
        ID_USUARIO: user.id,
        JUEGO: this.agregarEncuestaForm.value.JUEGO!,
        PUNTAJE: this.agregarEncuestaForm.value.PUNTAJE!,
        COMENTARIO: this.agregarEncuestaForm.value.COMENTARIO ?? null
      });

      Swal.fire({
        title: '¡Gracias!',
        text: 'Tu encuesta fue registrada correctamente.',
        icon: 'success',
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        }
      });

      this.router.navigateByUrl('/home');
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: err?.message || 'No se pudo registrar la encuesta.',
        icon: 'error',
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        }
      });
    }
  }
}
