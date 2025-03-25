import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { auth } from "../app/firebase";
import { User } from "firebase/auth";

interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  setUser: (user: AuthState["user"]) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    } as PersistOptions<AuthState> 
  )
);

auth.onAuthStateChanged(async (currentUser: User | null) => {
  if (currentUser) {
    await currentUser.reload(); 

    const user: AuthState["user"] = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL, 
    };

    useAuthStore.setState({ user });
  } else {
    useAuthStore.setState({ user: null });
  }
});

export default useAuthStore;