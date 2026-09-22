import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("darshanease_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getCurrentUser();
        setUser(res.data.user);
      } catch (err) {
        localStorage.removeItem("darshanease_token");
        localStorage.removeItem("darshanease_user");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    localStorage.setItem("darshanease_token", res.data.token);
    localStorage.setItem("darshanease_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await registerUser(data);
    localStorage.setItem("darshanease_token", res.data.token);
    localStorage.setItem("darshanease_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem("darshanease_token");
    localStorage.removeItem("darshanease_user");
    setUser(null);
  };

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("darshanease_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
