import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, syncAPI } from '../services/api';
import { getPendingSyncAttempts, clearPendingSyncAttempt } from '../services/offlineStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('vidyora_token'));
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({ pendingCount: 0, lastSynced: null });

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await triggerOfflineSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  const checkPendingSync = async () => {
    try {
      const pending = await getPendingSyncAttempts();
      setSyncStatus((prev) => ({ ...prev, pendingCount: pending.length }));
    } catch {
      // IndexedDB might not be available
    }
  };

  const triggerOfflineSync = async () => {
    if (!token) return;
    try {
      const pending = await getPendingSyncAttempts();
      if (pending.length > 0) {
        const res = await syncAPI.syncProgress(pending);
        if (res.data && res.data.syncedIds) {
          for (const item of pending) {
            await clearPendingSyncAttempt(item.tempId);
          }
          setSyncStatus({
            pendingCount: 0,
            lastSynced: new Date().toLocaleTimeString()
          });
        }
      }
    } catch (err) {
      console.warn('Sync attempt failed, will retry later:', err);
    }
  };

  // Load user on token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to authenticate token:', err);
        // Fallback to local cached user if offline
        const cachedUser = localStorage.getItem('vidyora_cached_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            localStorage.removeItem('vidyora_token');
            setToken(null);
          }
        } else {
          localStorage.removeItem('vidyora_token');
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('vidyora_token', newToken);
      localStorage.setItem('vidyora_cached_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('vidyora_token', newToken);
      localStorage.setItem('vidyora_cached_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const quickDemoLogin = async () => {
    return login('demo.student@vidyora.ai', 'vidyora123');
  };

  const setAuthSession = (newToken, userData) => {
    localStorage.setItem('vidyora_token', newToken);
    localStorage.setItem('vidyora_cached_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('vidyora_token');
    localStorage.removeItem('vidyora_cached_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isOnline,
        syncStatus,
        login,
        register,
        quickDemoLogin,
        logout,
        setAuthSession,
        checkPendingSync,
        triggerOfflineSync
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
