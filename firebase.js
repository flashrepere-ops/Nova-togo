import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { localCache: persistentLocalCache() });
export const google = new GoogleAuthProvider();
