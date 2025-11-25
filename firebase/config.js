import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQHwlxLgUjeXPqMmv5FxojjC5-Sn6iWpQ",
  authDomain: "grabandgo-6b67d.firebaseapp.com",
  projectId: "grabandgo-6b67d",
  storageBucket: "grabandgo-6b67d.firebasestorage.app",
  messagingSenderId: "740643668654",
  appId: "1:740643668654:web:2c0d051f58e1e93397a33f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
