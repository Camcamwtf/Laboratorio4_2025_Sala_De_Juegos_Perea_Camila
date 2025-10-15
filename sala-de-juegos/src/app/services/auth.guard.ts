import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, switchMap, take, map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ready$.pipe(
    filter(r => r === true),
    take(1),
    switchMap(() => auth.user$.pipe(take(1))),
    map(user => user ? true : router.createUrlTree(['/login']))
  );
};
