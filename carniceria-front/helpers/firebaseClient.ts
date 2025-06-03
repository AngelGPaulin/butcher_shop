// helpers/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "carniceriauaq.firebaseapp.com",
  databaseURL: "https://carniceriauaq-default-rtdb.firebaseio.com",
  projectId: "carniceriauaq",
  storageBucket: "carniceriauaq.firebasestorage.app",
  messagingSenderId: "728059229855",
  appId: "1:728059229855:web:215e187f2c5f8ad120d4aa",
  measurementId: "G-9R81YWRCVV"
};

const app = initializeApp(firebaseConfig);
<<<<<<< HEAD
export const auth=getAuth(app);
=======
export const auth = getAuth(app);
>>>>>>> 71d3c9c1e11632ee0074b8e3219f3a8fe8e961ce
