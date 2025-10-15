import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { combineLatest } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

export const NotAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return combineLatest([auth.ready$, auth.esAdmin$]).pipe(
    filter(([ready]) => ready),
    take(1),
    map(([_, isAdmin]) => !isAdmin ? true : router.createUrlTree(['/home']))
  );
};
