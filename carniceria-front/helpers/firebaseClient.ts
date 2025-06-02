// helpers/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBO45V1kEkesEpkczMSPy98qzg5WUANsD8",
  authDomain: "carniceriauaq.firebaseapp.com",
  databaseURL: "https://carniceriauaq-default-rtdb.firebaseio.com",
  projectId: "carniceriauaq",
  storageBucket: "carniceriauaq.firebasestorage.app",
  messagingSenderId: "728059229855",
  appId: "1:728059229855:web:215e187f2c5f8ad120d4aa",
  measurementId: "G-9R81YWRCVV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);