import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, isAdmin } from './authHelper';

/**
 * For regular logged-in users.
 * If logged in, shows the page.
 * If not, redirects to /login.
 */
export const UserProtectedRoute = () => {
  const isAuth = isAuthenticated();

  // If authorized, render the child component (e.g., ProfilePage)
  // Otherwise, redirect to the login page
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * For Admin users only.
 * If logged in AND is an admin, shows the page.
 * If not, redirects to the homepage (or /login if not logged in at all).
 */
export const AdminProtectedRoute = () => {
  const isAuth = isAuthenticated();
  const admin = isAdmin();

  if (!isAuth) {
    // Not logged in at all
    return <Navigate to="/login" replace />;
  }

  // Logged in, but ARE THEY ADMIN?
  // If they are an admin, show the admin page.
  // If they are just a user, redirect them to the homepage.
  return admin ? <Outlet /> : <Navigate to="/" replace />;
};