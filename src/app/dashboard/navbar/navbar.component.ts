import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css'],
  imports: [CommonModule,RouterLink,MatIcon,RouterModule]
})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  get userRole(): string | null {
    return this.authService.getUserRole();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
  }

    // Now check if the current route is the login page
    isLoginPage(): boolean {
      console.log('url'+this.router.url)
      return this.router.url === '/';  // Match the URL of the login page
    }
}
