import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import AuthService from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  canManageUsers: () => boolean;
  canManageProjects: () => boolean;
  canManageTeams: () => boolean;
  canCreateTasks: () => boolean;
  canCreateSprints: () => boolean;
  canCreateMilestones: () => boolean;
  canViewReports: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = () => {
      const user = AuthService.getCurrentUser();
      const token = AuthService.getToken();
      
      if (user && token) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await AuthService.login(credentials);
      if (response.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      } else {
        throw new Error('User information not received');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const hasRole = (roles: string[]) => {
    return AuthService.hasRole(roles);
  };

  const canManageUsers = () => AuthService.canManageUsers();
  const canManageProjects = () => AuthService.canManageProjects();
  const canManageTeams = () => AuthService.canManageTeams();
  const canCreateTasks = () => AuthService.canCreateTasks();
  const canCreateSprints = () => AuthService.canCreateSprints();
  const canCreateMilestones = () => AuthService.canCreateMilestones();
  const canViewReports = () => AuthService.canViewReports();

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    hasRole,
    canManageUsers,
    canManageProjects,
    canManageTeams,
    canCreateTasks,
    canCreateSprints,
    canCreateMilestones,
    canViewReports,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
