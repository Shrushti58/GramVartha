import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../services/api';

export default function AdminDash() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await api.getAdminProfile();
        if (res.data.role === 'superadmin') {
          navigate('/admin/superadmin');
        } else {
          navigate('/admin/village');
        }
      } catch (error) {
        toast.error('Authentication required');
        navigate('/admin/login');
      }
    };

    checkRole();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted dark:text-dark-text-muted">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}