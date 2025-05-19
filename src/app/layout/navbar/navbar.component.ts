import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  userEmail: string | null = null;
  private subscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.subscription = this.authService.userEmail$.subscribe(email => {
      this.userEmail = email;
    });
  }

  ngOnInit(): void {
    this.userEmail = this.authService.getUserEmail();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  signOut() {
    localStorage.removeItem('token');
    this.authService.clearUserEmail();
    this.router.navigate(['/login']);
  }
}
