import React, { createContext, ReactNode, useContext, useState } from 'react';

interface User {
    id: number;
    nome: string;
    biografia: string;
    email: string;
    senha: string;
    nomeUsuario: string;
}

interface UserContextType {
    userData: User | null;
    setUserData: (userData: User | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
