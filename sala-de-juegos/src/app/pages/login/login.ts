import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ],
  templateUrl: './login.html',
  styles: [`
    .center { min-height: calc(100dvh - 64px); display:grid; place-items:center; padding:16px; }
    .full { width: 320px; max-width: 90vw; }
    mat-card { padding: 24px; width: fit-content; }
    h2 { margin: 0 0 12px; font-weight: 600; }
  `]
})
export class Login {
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private auth = inject(AuthService);

  isRegister = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode() { this.isRegister.update(v => !v); }

  async onSubmit() {
    if (this.form.invalid) {
      this.snack.open('Completá email y contraseña (mín. 6).', 'OK', { duration: 2500 });
      return;
    }
    const { email, password } = this.form.value;
    try {
      if (this.isRegister()) {
        await this.auth.register(email!, password!);
        this.snack.open('Cuenta creada. ¡Bienvenida!', 'OK', { duration: 2000 });
      } else {
        await this.auth.login(email!, password!);
        this.snack.open('Ingreso correcto.', 'OK', { duration: 1500 });
      }
      this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.snack.open(e?.message ?? 'Error de autenticación.', 'OK', { duration: 3000 });
    }
  }
}
