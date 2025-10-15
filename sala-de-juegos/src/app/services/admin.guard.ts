import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, switchMap, take, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ready$.pipe(
    filter(r => r === true),
    take(1),
    switchMap(() => auth.esAdmin$.pipe(take(1))),
    map(isAdmin => {
      if (isAdmin) return true;

      Swal.fire({
        title: 'Acceso restringido',
        text: 'Solo usuarios con perfil Administrador pueden ver Encuestas.',
        icon: 'warning',
        customClass: {
          popup: 'swal-cold-popup',
          title: 'swal-cold-title',
          confirmButton: 'swal-cold-btn'
        }
      });

      return router.createUrlTree(['/home']);
    })
  );
};
