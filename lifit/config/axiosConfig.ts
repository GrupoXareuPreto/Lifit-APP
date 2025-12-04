import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { apiAZURE } from './cloudinaryConfig';

const api = axios.create({
    baseURL: apiAZURE,
});

// Token em memória como fallback
let tokenInMemory: string | null = null;

// Função para definir o token globalmente
export const setApiToken = (token: string | null) => {
    tokenInMemory = token;
    console.log('axiosConfig - Token definido em memória:', token ? 'SIM' : 'NÃO');
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
    async (config) => {
        try {
            // Priorizar token em memória, depois AsyncStorage
            let token = tokenInMemory;
            
            if (!token) {
                token = await AsyncStorage.getItem('@lifit:token');
                
                // Se não encontrou, aguardar um pouco e tentar novamente
                if (!token) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    token = await AsyncStorage.getItem('@lifit:token');
                }
                
                // Se encontrou no AsyncStorage, atualizar memória
                if (token) {
                    tokenInMemory = token;
                }
            }
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Token adicionado à requisição');
            } else {
                console.log('Nenhum token encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de token inválido/expirado
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Apenas 401 (não autorizado) - token expirado
            console.log('Token expirado ou inválido');
            await AsyncStorage.removeItem('@lifit:token');
            setApiToken(null);
        }
        // 403 pode ser falta de permissão, não necessariamente token inválido
        return Promise.reject(error);
    }
);

export default api;
