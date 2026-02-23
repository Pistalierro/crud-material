import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideFirebaseApp} from '@angular/fire/app';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';

import {routes} from './app.routes';

import {initializeApp} from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBLL5qqcWT8xFvbi2NYfxQhSUyonj13yzI',
  authDomain: 'crud-material-d7289.firebaseapp.com',
  projectId: 'crud-material-d7289',
  storageBucket: 'crud-material-d7289.firebasestorage.app',
  messagingSenderId: '428040604972',
  appId: '1:428040604972:web:ece17f2ac114a39f6a3089'
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ],
};
