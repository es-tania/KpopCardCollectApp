import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    store.init();
  }, []);

  return {
    session: store.session,
    user: store.user,
    isAdmin: store.isAdmin,
    loading: store.loading,
    isAuthenticated: !!store.session,
    signOut: store.signOut,
  };
};
