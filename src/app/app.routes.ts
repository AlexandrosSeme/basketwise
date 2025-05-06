import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { TacticsComponent } from './views/tactics/tactics.component';
import { PlayersComponent } from './views/players/players.component';
import { LoginComponent } from './views/login/login.component';
import { AuthGuard } from './guards/guards/auth.guard'; 


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, // Σελίδα login χωρίς προστασία
  },
  {
    path: '',
    canActivate: [AuthGuard], // Προστασία με AuthGuard
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'tactics', component: TacticsComponent },
      { path: 'players', component: PlayersComponent },
    ],
  }
];