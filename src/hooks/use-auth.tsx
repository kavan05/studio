"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth as useFirebaseAuth, useFirestore } from "@/firebase";

interface AdditionalUserData {
  name: string;
  profession: string;
  referralSource: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential>;
  signup: (email: string, pass: string, additionalData: AdditionalUserData) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("Auth not initialized"); },
  signup: async () => { throw new Error("Auth not initialized"); },
  logout: async () => { throw new Error("Auth not initialized"); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Auth is not initialized yet.
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = (email: string, pass: string) => {
    if (!auth) throw new Error("Auth not initialized");
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, additionalData: AdditionalUserData) => {
    if (!auth || !firestore) throw new Error("Firebase not initialized");
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { user } = userCredential;

    // Now, create the user document in Firestore
    const userRef = doc(firestore, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: additionalData.name,
      profession: additionalData.profession,
      referralSource: additionalData.referralSource,
      apiKey: `bh_live_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`,
      usage: 0,
      createdAt: serverTimestamp(),
    });

    return userCredential;
  };

  const logout = () => {
    if (!auth) throw new Error("Auth not initialized");
    return signOut(auth);
  };

  const value = {
    user,
    loading: loading || !auth,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
