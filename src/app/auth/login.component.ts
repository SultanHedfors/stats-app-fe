import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [MatToolbarModule,RouterModule,MatFormFieldModule,MatCardModule, FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';
   title = 'title';

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.username, this.password);
  }
}
