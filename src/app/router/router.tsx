import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';

const Homepage = lazy(() => import('@/pages/landing/Homepage'));
const LoginPage = lazy(() => import('@/pages/auth/Login'));
const SignupPage = lazy(() => import('@/pages/auth/Signup'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPassword'));
const EditorPage = lazy(() => import('@/pages/editor/EditorPage'));
const BrandKitPage = lazy(() => import('@/pages/dashboard/BrandKitPage'));
const SharePage = lazy(() => import('@/pages/landing/SharePage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F11]" />}>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<Homepage />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:projectId"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/brand"
          element={
            <ProtectedRoute>
              <BrandKitPage />
            </ProtectedRoute>
          }
        />
        <Route path="/brand" element={<Navigate to="/dashboard/brand" replace />} />

        <Route path="/share/:slug" element={<SharePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

