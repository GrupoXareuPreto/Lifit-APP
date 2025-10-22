import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { apiAZURE } from './cloudinaryConfig';

const api = axios.create({
    baseURL: apiAZURE,
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@lifit:token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token inválido ou expirado
            await AsyncStorage.removeItem('@lifit:token');
            Alert.alert('Erro', 'Token inválido');
        }
        return Promise.reject(error);
    }
);

export default api;
