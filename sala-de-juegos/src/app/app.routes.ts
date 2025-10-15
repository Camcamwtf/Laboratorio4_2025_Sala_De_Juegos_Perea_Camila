import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard';
import { NotAdminGuard } from './services/not-admin.guard';

export const routes: Routes = [
  {
    path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'home', canActivate: [AuthGuard], loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'quien-soy', canActivate: [AuthGuard], loadComponent: () => import('./pages/quien-soy/quien-soy').then(m => m.QuienSoy)
  },
  {
    path: 'ahorcado', canActivate: [AuthGuard], loadComponent: () => import('./pages/juegos/ahorcado/ahorcado').then(m => m.Ahorcado)
  },
  {
    path: 'mayor-menor', canActivate: [AuthGuard], loadComponent: () => import('./pages/juegos/mayor-menor/mayor-menor').then(m => m.MayorMenor)
  },
  {
    path: 'preguntados', canActivate: [AuthGuard], loadComponent: () => import('./pages/juegos/preguntados/preguntados').then(m => m.Preguntados)
  },
  {
    path: 'arkanoid', canActivate: [AuthGuard], loadComponent: () => import('./pages/juegos/arkanoid/arkanoid').then(m => m.Arkanoid)
  },
  {
    path: 'estadisticas', canActivate: [AuthGuard], loadComponent: () => import('./pages/estadisticas/estadisticas').then(m => m.Estadisticas)
  },
  { 
    path: 'encuestas', canActivate: [AuthGuard, AdminGuard], loadComponent: () => import('./pages/encuestas/encuestas').then(m => m.Encuestas)
  },
  {
    path: 'agregar-encuesta', canActivate: [AuthGuard, NotAdminGuard], loadComponent: () => import('./pages/encuestas/agregar-encuesta/agregar-encuesta').then(m => m.AgregarEncuesta)
  },
  {
    path: '', pathMatch: 'full', redirectTo: 'home'
  }
];
