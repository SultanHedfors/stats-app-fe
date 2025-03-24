import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { ProceduresListComponent } from './dashboard/procedures-list/procedures-list.component';
import { WorkStatsListComponent } from './dashboard/work-stats/work-stats-list.component';
import { AuthGuard } from './auth/auth.guard';



export const routes: Routes = [
  { path: '', component: LoginComponent }, // 👈 Default route = Login screen
  { path: 'work-stats', component: WorkStatsListComponent, canActivate: [AuthGuard]  },
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'procedures-list', component: ProceduresListComponent, canActivate: [AuthGuard]  },
  { path: '**', redirectTo: '' } // 👈 Redirect unknown routes to login
];
