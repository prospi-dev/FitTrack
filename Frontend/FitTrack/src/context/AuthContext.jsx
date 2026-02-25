import { createContext, useContext, useState } from "react";

// AuthContext holds the current user's token + info
// Any component in the app can call useAuth() to get or update it.

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    // Initialize from localStorage so the user stays logged in on refresh
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    })

    // Called after a succesful login  or register
    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            name: data.name,
            email: data.email,
            role: data.role,
        }));
        setToken(data.token);
        setUser({
            name: data.name,
            email: data.email,
            role: data.role,
        })
    }

    // Clears everything and sends the user back to login
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{token, user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to easily access the auth context from any component
export function useAuth() {
    return useContext(AuthContext);
}