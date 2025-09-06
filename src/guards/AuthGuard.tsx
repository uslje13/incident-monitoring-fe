
import React from 'react';
import { Navigate } from 'react-router-dom';

export const AuthGuard = ({ children, isLoginPage = false }: { children: React.ReactNode; isLoginPage?: boolean }) => {
    const isAuthenticated = !!localStorage.getItem('authToken');

    if (isLoginPage && isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    if (!isAuthenticated && !isLoginPage) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
