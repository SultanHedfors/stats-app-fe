import { Component, Inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [MatToolbarModule,RouterOutlet]
})
export class DashboardComponent {
  constructor(@Inject (AuthService) public authService: AuthService) {}
}
