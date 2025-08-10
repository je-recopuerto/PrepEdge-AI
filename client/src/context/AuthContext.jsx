// import React, { createContext, useContext, useEffect, useState } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../firebase";

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const logout = () => {
//     auth.signOut()
//       .then(() => {
//         setUser(null);
//         setIsLoggedIn(false);
//       })
//       .catch((error) => {
//         console.error("Logout failed:", error);
//       });
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         setUser(firebaseUser);
//         setIsLoggedIn(true);
//       } else {
//         setUser(null);
//         setIsLoggedIn(false);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, setUser, loading, setLoading, isLoggedIn, setIsLoggedIn, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    if (!auth) {
      console.warn("Firebase auth disabled — logout skipped");
      setUser(null);
      setIsLoggedIn(false);
      return;
    }
    auth.signOut()
      .then(() => {
        setUser(null);
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth disabled — using mock user");
      setUser({ displayName: "Test User", email: "test@example.com" });
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading, isLoggedIn, setIsLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
