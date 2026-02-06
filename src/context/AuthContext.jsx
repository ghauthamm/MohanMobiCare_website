import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, role = 'user') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save user role to database
        await set(ref(database, `users/${userCredential.user.uid}`), {
            email: email,
            role: role,
            createdAt: new Date().toISOString()
        });
        return userCredential;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    async function signInWithGoogle() {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user already exists in database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        // If new user, create their record with 'user' role
        if (!snapshot.exists()) {
            await set(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: 'user',
                createdAt: new Date().toISOString(),
                provider: 'google'
            });
        }

        return result;
    }

    async function getUserRole(uid) {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return snapshot.val().role;
        }
        return 'user';
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const role = await getUserRole(user.uid);
                setUserRole(role);
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        logout,
        signInWithGoogle,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
