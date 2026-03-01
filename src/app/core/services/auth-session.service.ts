import {EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {Auth, authState, GoogleAuthProvider, signInAnonymously, signInWithPopup} from '@angular/fire/auth';
import {Observable, switchMap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly auth = inject(Auth);
  private readonly injector = inject(EnvironmentInjector);

  async ensureAnonymousAuth(): Promise<void> {
    await runInInjectionContext(this.injector, () => this.auth.authStateReady());
    if (this.auth.currentUser) return;
    await runInInjectionContext(this.injector, () => signInAnonymously(this.auth));
    console.log('signInAnonymously - true');
  }


  async signInAsAdmin(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await runInInjectionContext(this.injector, () => signInWithPopup(this.auth, provider));
    console.log('signInAsAdmin - true');
  }

  async refreshAuthToken(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User is not authenticated');
    await user.getIdToken(true);
  }

  async isAdmin(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims['admin'] === true;
  }

  adminState$(): Observable<boolean> {
    return runInInjectionContext(this.injector, () =>
      authState(this.auth).pipe(
        switchMap(async (user) => {
          if (!user) return false;
          const tokenResult = await user.getIdTokenResult();
          return tokenResult.claims['admin'] === true;
        }),
      ),
    );
  }

}
