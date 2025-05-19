import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userEmailSubject = new BehaviorSubject<string | null>(null);
  userEmail$ = this.userEmailSubject.asObservable();

  constructor() {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      this.userEmailSubject.next(storedEmail);
    }
  }

  setUserEmail(email: string) {
    localStorage.setItem('userEmail', email);
    this.userEmailSubject.next(email);
  }

  clearUserEmail() {
    localStorage.removeItem('userEmail');
    this.userEmailSubject.next(null);
  }

  getUserEmail(): string | null {
    return this.userEmailSubject.value;
  }
} 