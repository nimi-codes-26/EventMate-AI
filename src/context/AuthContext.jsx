import { createContext, useContext, useState, useEffect } from "react";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail as firebaseRegister,
  logoutUser,
  auth,
  dbAPI
} from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // ✅ ensure profile exists
        const profile = await dbAPI.getProfile(user.uid);

        if (!profile) {
          await dbAPI.updateProfile(user.uid, {
            fullName: "",
            email: user.email,
            phone: "",
            bio: "",
            organization: "",
            createdAt: new Date()
          });
        }
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // =========================
  // GOOGLE LOGIN
  // =========================
  const loginWithGoogleHook = async () => {
    try {
      const res = await loginWithGoogle();

      // ensure profile
      await dbAPI.updateProfile(res.user.uid, {
        email: res.user.email
      });

      toast.success("Logged in with Google");
      return res;
    } catch (err) {
      toast.error("Google login failed");
      throw err;
    }
  };

  // =========================
  // EMAIL LOGIN
  // =========================
  const loginWithEmailHook = async (email, password) => {
    try {
      const res = await loginWithEmail(email, password);
      toast.success("Login successful");
      return res;
    } catch (err) {
      toast.error("Invalid email or password");
      throw err;
    }
  };

  // =========================
  // REGISTER
  // =========================
  const registerWithEmailHook = async (email, password) => {
    try {
      const res = await firebaseRegister(email, password);

      // create profile
      await dbAPI.updateProfile(res.user.uid, {
        fullName: "",
        email: res.user.email,
        phone: "",
        bio: "",
        organization: "",
        createdAt: new Date()
      });

      toast.success("Account created successfully");
      return res;
    } catch (err) {
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginWithGoogle: loginWithGoogleHook,
        loginWithEmail: loginWithEmailHook,
        registerWithEmail: registerWithEmailHook,
        logout,
        loading
      }}
    >
      {/* ✅ prevent UI flash before auth loads */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);