import {inject, Injectable} from '@angular/core';
import {Auth, signInAnonymously} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly auth = inject(Auth);

  async ensureAnonymousAuth(): Promise<void> {
    if (this.auth.currentUser) return;
    await signInAnonymously(this.auth);
  }
}
