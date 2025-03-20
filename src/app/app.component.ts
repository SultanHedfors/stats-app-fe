import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { NavbarComponent } from "./dashboard/navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,RouterModule, NavbarComponent], // Import RouterModule for routing
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'employee-stats-fe';

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }}