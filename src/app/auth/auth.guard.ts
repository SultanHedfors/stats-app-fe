import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      console.log('Auth guard: is logged in');
      return true;
    }
     console.log('redirecting to login');
    this.router.navigate(['/login']); // Redirect to login if not logged in
    return false;
  }
}
