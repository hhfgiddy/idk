import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAi21iXsTpBL9SnA7EmpYAjlaiZFouQl3g",
  authDomain: "chat-with-s.firebaseapp.com",
  databaseURL: "https://chat-with-s-default-rtdb.firebaseio.com",
  projectId: "chat-with-s",
  storageBucket: "chat-with-s.firebasestorage.app",
  messagingSenderId: "528043822936",
  appId: "1:528043822936:web:4509979ab807e12add1f2d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
