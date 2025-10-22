import React, { createContext, ReactNode, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Post {
    id: number;
    midia: string;
    titulo: string;
    descricao: string;
    dataPublicacao: string;
    curtidas: any[];
    comentarios: any[];
    compartilhamentos: any[];
}

interface User {
    id: number;
    nome: string;
    biografia: string | null;
    email: string;
    senha: string;
    nomeUsuario: string;
    metas: any[];
    postagens: Post[];
    curtidas: any[];
    comentarios: any[];
    eventosCriados: any[];
    mensagens: any[];
    compartilhamentos: any[];
    eventosParticipar: any[];
    seguidores: any[];
    seguindo: any[];
    conversas: any[];
}

interface UserContextType {
    userData: User | null;
    token: string | null;
    setUserData: (userData: User | null) => void;
    setToken: (token: string | null) => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      await AsyncStorage.setItem('@lifit:token', newToken);
    } else {
      await AsyncStorage.removeItem('@lifit:token');
    }
  };

  const logout = async () => {
    setUserData(null);
    setTokenState(null);
    await AsyncStorage.removeItem('@lifit:token');
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, token, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("errou useUser");
    }
    return context;
};
