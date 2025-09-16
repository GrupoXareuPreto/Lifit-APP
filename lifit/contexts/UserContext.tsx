import React, { createContext, ReactNode, useContext, useState } from 'react';

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
        throw new Error("errou useUser");
    }
    return context;
};
