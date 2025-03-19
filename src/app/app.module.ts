import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './auth/login.component';

import { AuthService } from './auth/auth.service';
import { DashboardComponent } from './dashboard/dash/dashboard.component';
import { ProceduresListComponent } from './dashboard/procedures-list/procedures-list.component';

import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { WorkStatsListComponent } from './dashboard/work-stats/work-stats-list.component';


@NgModule({
  declarations: [

  ],
  imports: [
    AppComponent,
    BrowserModule,
    RouterOutlet,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    LoginComponent,
    DashboardComponent,
    WorkStatsListComponent,
    ProceduresListComponent
  ],
  providers: [AuthService],
  bootstrap: []
})
export class AppModule { }
