import {ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideFirebaseApp} from '@angular/fire/app';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {initializeApp} from 'firebase/app';

import {firebaseConfig} from '../environments/firebase.config.local';
import {routes} from './app.routes';
import {provideNativeDateAdapter} from '@angular/material/core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideNativeDateAdapter(),
    {provide: LOCALE_ID, useValue: 'uk-UA'},
  ],
};
