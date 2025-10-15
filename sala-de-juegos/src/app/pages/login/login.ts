import { Router } from '@angular/router';
import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
    MatIconModule
  ],
  templateUrl: 'login.html',
  styleUrl: 'login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  @ViewChild('loginBtn') loginBtn!: ElementRef<HTMLButtonElement>;

  isRegister = signal(false);
  mostrarClave1 = false;
  mostrarClave2 = false;
  esLogueoRapido = false;

  form = this.fb.group({
    nombre: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['']
  }, { validators: this.sonClavesIguales() });

  constructor() {
    this.aplicarValidaciones();
  }

  toggleMode() {
    this.isRegister.update(v => !v);
    this.aplicarValidaciones();
  }

  private sonClavesIguales() {
    return (group: AbstractControl): ValidationErrors | null => {
      const isReg = this.isRegister();
      const pass = group.get('password')?.value;
      const conf = group.get('passwordConfirm')?.value;
      if (!isReg) return null;
      return pass && conf && pass !== conf ? { passwordMismatch: true } : null;
    };
  }

  private aplicarValidaciones() {
    const nombreCtrl = this.form.controls.nombre!;
    if (this.isRegister()) {
      nombreCtrl.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      nombreCtrl.clearValidators();
      nombreCtrl.setValue(nombreCtrl.value ?? '');
    }
    nombreCtrl.updateValueAndValidity({ emitEvent: false });
  }

  async loginRapido(email: string, password: string) {
    if (this.esLogueoRapido) return;
    this.esLogueoRapido = true;
    try {
      await this.auth.login(email, password);

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: '¡Bienvenido a la Sala de Juegos!',
        showConfirmButton: false,
        timer: 1800,
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        },
        buttonsStyling: false
      });

      this.router.navigateByUrl('/home');
    } catch (e: any) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'No se pudo iniciar sesión',
        text: e?.message || 'Revisá las credenciales.',
        showConfirmButton: true,
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        },
        buttonsStyling: false
      });
    } finally {
      this.esLogueoRapido = false;
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Correo electrónico y/o contraseña inválidos.',
        showConfirmButton: false,
        timer: 2000,
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        },
        buttonsStyling: false
      });
      return;
    }

    const { email, password, nombre } = this.form.getRawValue() as any;

    try {
      if (this.isRegister()) {
        await this.auth.register(email, password, nombre);

        try {
          await this.auth.login(email, password);

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '¡Cuenta creada y sesión iniciada!',
            showConfirmButton: false,
            timer: 1800,
            customClass: {
              popup: 'swal-cold-popup',
              title: 'swal-cold-title',
              confirmButton: 'swal-cold-btn'
            },
            buttonsStyling: false
          });

          this.router.navigateByUrl('/home');
          return;
        } catch {
          Swal.fire({
            icon: 'info',
            title: '¡Cuenta creada!',
            text: 'Revisá tu correo para confirmar la cuenta y poder iniciar sesión.',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'swal-cold-popup',
              title: 'swal-cold-title',
              confirmButton: 'swal-cold-btn'
            },
            buttonsStyling: false
          });
          this.isRegister.set(false);
          this.aplicarValidaciones();
          return;
        }
      } else {
        await this.auth.login(email, password);

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: '¡Bienvenido a la Sala de Juegos!',
          showConfirmButton: false,
          timer: 2000,
          customClass: {
            popup: 'swal-cold-popup',
            title: 'swal-cold-title',
            confirmButton: 'swal-cold-btn'
          },
          buttonsStyling: false
        });

        this.router.navigateByUrl('/home');
      }
    } catch (e: any) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: '¡Error al iniciar sesión o registrarse!',
        text: 'Correo electrónico y/o contraseña inválidos.',
        confirmButtonText: 'OK',
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
