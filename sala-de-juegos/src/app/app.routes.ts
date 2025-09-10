import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'home', canActivate: [authGuard], loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'quien-soy', canActivate: [authGuard], loadComponent: () => import('./pages/quien-soy/quien-soy').then(m => m.QuienSoy) },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '**', redirectTo: 'home' }
];
