import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardComponent } from './dashboard/dash/dashboard.component';
import { ProceduresListComponent } from './dashboard/procedures-list/procedures-list.component';
import { WorkStatsListComponent } from './dashboard/work-stats/work-stats-list.component';



export const routes: Routes = [
  { path: '', component: LoginComponent }, // 👈 Default route = Login screen
  { path: 'dashboard', component: DashboardComponent },
  { path: 'work-stats', component: WorkStatsListComponent },
  { path: 'procedures', component: ProceduresListComponent },
  { path: '**', redirectTo: '' } // 👈 Redirect unknown routes to login
];
