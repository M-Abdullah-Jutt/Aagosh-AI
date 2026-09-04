import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HealthPage from '../pages/HealthPage';
import NotFoundPage from '../pages/NotFoundPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ChildrenPage from '../pages/Children/ChildrenPage';
import AddChildPage from '../pages/Children/AddChildPage';
import ChildDetailsPage from '../pages/Children/ChildDetailsPage';
import EditChildPage from '../pages/Children/EditChildPage';
import GoalsPage from '../pages/Goals/GoalsPage';
import CheckInsListPage from '../pages/CheckIns/CheckInsListPage';
import CreateCheckInPage from '../pages/CheckIns/CreateCheckInPage';
import CheckInDetailsPage from '../pages/CheckIns/CheckInDetailsPage';
import EditCheckInPage from '../pages/CheckIns/EditCheckInPage';
import AnalyticsPage from '../pages/Analytics/AnalyticsPage';
import KnowledgeSearchPage from '../pages/Knowledge/KnowledgeSearchPage';
import CoachDevPage from '../pages/Coach/CoachDevPage';
import CoachPage from '../pages/Coach/CoachPage';
import ProtectedRoute from '../components/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children"
        element={
          <ProtectedRoute>
            <ChildrenPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/new"
        element={
          <ProtectedRoute>
            <AddChildPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId"
        element={
          <ProtectedRoute>
            <ChildDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId/edit"
        element={
          <ProtectedRoute>
            <EditChildPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId/goals"
        element={
          <ProtectedRoute>
            <GoalsPage />
          </ProtectedRoute>
        }
      />

      {/* Step 5 Check-Ins Protected Routes */}
      <Route
        path="/children/:childId/check-ins"
        element={
          <ProtectedRoute>
            <CheckInsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId/check-ins/new"
        element={
          <ProtectedRoute>
            <CreateCheckInPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId/check-ins/:checkInId"
        element={
          <ProtectedRoute>
            <CheckInDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/children/:childId/check-ins/:checkInId/edit"
        element={
          <ProtectedRoute>
            <EditCheckInPage />
          </ProtectedRoute>
        }
      />

      {/* Step 6 Analytics Protected Route */}
      <Route
        path="/children/:childId/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      {/* Step 8C Production Parenting Coach Route */}
      <Route
        path="/children/:childId/coach"
        element={
          <ProtectedRoute>
            <CoachPage />
          </ProtectedRoute>
        }
      />

      {/* Step 7 Developer Knowledge Base Search Route */}
      <Route
        path="/dev/knowledge"
        element={
          <ProtectedRoute>
            <KnowledgeSearchPage />
          </ProtectedRoute>
        }
      />

      {/* Step 8B Grounded LLM Coach Developer Route */}
      <Route
        path="/dev/coach"
        element={
          <ProtectedRoute>
            <CoachDevPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
