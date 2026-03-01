import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

//process.env u produkciji
const firebaseConfig = {
  apiKey: 'AIzaSyB_JjhWjrIqUcDqwPom--V06y0CCw6r-2s',
  authDomain: 'assigmnet-3d.firebaseapp.com',
  projectId: 'assigmnet-3d',
  storageBucket: 'assigmnet-3d.firebasestorage.app',
  messagingSenderId: '183497904475',
  appId: '1:183497904475:web:c53b903f7d7c6a41c0ca7e',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
