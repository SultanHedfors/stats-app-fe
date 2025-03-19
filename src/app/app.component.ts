import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // Import RouterModule for routing
  template: `
    <h1>Employee Stats</h1>
    <router-outlet></router-outlet> <!-- Necessary for route rendering -->
  `,
})
export class AppComponent {}
