import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setApiToken } from '@/config/axiosConfig';

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
    fotoPerfil: string | null;
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
  const [isLoading, setIsLoading] = useState(true);

  // Carregar token do AsyncStorage ao iniciar
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@lifit:token');
        if (storedToken) {
          setTokenState(storedToken);
          setApiToken(storedToken);
          console.log('UserContext - Token carregado do AsyncStorage no início');
        }
      } catch (error) {
        console.error('Erro ao carregar token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const setToken = async (newToken: string | null) => {
    console.log('UserContext - setToken chamado com:', newToken ? 'token válido' : 'null');
    setTokenState(newToken);
    
    // Definir token em memória para o axios
    setApiToken(newToken);
    
    if (newToken) {
      try {
        await AsyncStorage.setItem('@lifit:token', newToken);
        console.log('UserContext - Token salvo no AsyncStorage');
        // Verificar se realmente salvou
        const verificar = await AsyncStorage.getItem('@lifit:token');
        console.log('UserContext - Verificação: token existe?', verificar ? 'SIM' : 'NÃO');
      } catch (error) {
        console.error('UserContext - Erro ao salvar token:', error);
      }
    } else {
      await AsyncStorage.removeItem('@lifit:token');
      console.log('UserContext - Token removido do AsyncStorage');
    }
  };

  const logout = async () => {
    setUserData(null);
    setTokenState(null);
    setApiToken(null);
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
