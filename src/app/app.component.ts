// app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "./dashboard/navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar *ngIf="initialized && authService.isLoggedIn()"></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  initialized = false;
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Simulate initialization delay if needed (e.g., token validation)
    setTimeout(() => {
      this.initialized = true;
    }, 0);
  }
}
