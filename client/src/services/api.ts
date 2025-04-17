import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Common headers with auth token
const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Match preferences API
export const matchPreferenceApi = {
  // Get all match types
  getAllMatchTypes: async () => {
    const response = await fetch(`${API_URL}/match-preferences/types`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch match types');
    }
    
    return response.json();
  },
  
  // Get user's match preferences
  getUserMatchPreferences: async () => {
    const response = await fetch(`${API_URL}/match-preferences/user`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user match preferences');
    }
    
    return response.json();
  },
  
  // Update user's match preferences
  updateUserMatchPreferences: async (matchTypeIds: string[]) => {
    const response = await fetch(`${API_URL}/match-preferences/user`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ matchTypeIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update match preferences');
    }
    
    return response.json();
  }
};

// Auth API
export const authApi = {
  login: async (nicknameOrEmail: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ nicknameOrEmail, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }
    
    return response.json();
  },
  
  register: async (userData: User) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register');
    }
    
    return response.json();
  },
  
  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to logout');
    }
    
    return response.json();
  },
  
  refresh: async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return response.json();
  }
};