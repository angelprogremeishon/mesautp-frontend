import { createContext, useContext, useEffect, useState } from 'react';
import { logout as apiLogout } from '@/api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user,  setUser]    = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [token, setToken]   = useState(() => localStorage.getItem('token'));
    const [ready, setReady]   = useState(false);

    useEffect(() => { setReady(true); }, []);

    const login = (tokenValue, userData) => {
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('user',  JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
    };

    const logoutUser = async () => {
        try { await apiLogout(); } catch { /* ignore */ }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, ready, isAuth: !!token, login, logout: logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
