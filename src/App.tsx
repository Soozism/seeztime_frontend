import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoading } from './components/Loading';
import Login from './pages/Login';

import { persianLocale } from './utils/dateConfig';
import './App.css';
import './styles/enhancements.css';

const { defaultAlgorithm } = theme;

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const TaskDetailEnhanced = React.lazy(() => import('./pages/TaskDetailEnhanced'));
const Kanban = React.lazy(() => import('./pages/Kanban'));
const Teams = React.lazy(() => import('./pages/Teams'));
const Users = React.lazy(() => import('./pages/Users'));
const Sprints = React.lazy(() => import('./pages/Sprints'));
const Backlogs = React.lazy(() => import('./pages/Backlogs'));
const BugReports = React.lazy(() => import('./pages/BugReports'));
const TimeLogs = React.lazy(() => import('./pages/TimeLogs'));
const Milestones = React.lazy(() => import('./pages/Milestones'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Planner = React.lazy(() => import('./pages/Planner'));
const WorkingHoursManagement = React.lazy(() => import('./pages/WorkingHoursManagement'));
const Holidays = React.lazy(() => import('./pages/Holidays'));
const TimeOffRequests = React.lazy(() => import('./pages/TimeOffRequests'));
const PersonalCalendar = React.lazy(() => import('./pages/PersonalCalendar'));
const LoginDebug = React.lazy(() => import('./pages/LoginDebug'));

// Loading component
const LoadingSpinner = () => <PageLoading tip="در حال بارگذاری..." />;

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          algorithm: defaultAlgorithm,
          token: {
            colorPrimary: '#006D77',
            colorTextSecondary: '#FF6F61',
            colorBgBase: '#F5F5EB',
            colorText: '#333333',
            borderRadius: 10,
            colorBorder: '#A8B5A2',
            colorBgContainer: '#FFFFFF',
          },
        }}
        direction="rtl"
        locale={persianLocale}
      >
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/debug" element={<Suspense fallback={<LoadingSpinner />}><LoginDebug /></Suspense>} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route 
                path="dashboard" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Dashboard />
                  </Suspense>
                } 
              />
              <Route 
                path="projects" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Projects />
                  </Suspense>
                } 
              />
              <Route 
                path="projects/:id" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProjectDetail />
                  </Suspense>
                } 
              />
              <Route 
                path="tasks" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Tasks />
                  </Suspense>
                } 
              />
              <Route 
                path="tasks/:id" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <TaskDetailEnhanced />
                  </Suspense>
                } 
              />
              <Route 
                path="kanban" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Kanban />
                  </Suspense>
                } 
              />
              <Route 
                path="teams" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Teams />
                  </Suspense>
                } 
              />
              <Route 
                path="users" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Users />
                  </Suspense>
                } 
              />
              <Route 
                path="sprints" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Sprints />
                  </Suspense>
                } 
              />
              <Route 
                path="backlogs" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Backlogs />
                  </Suspense>
                } 
              />
              <Route 
                path="bug-reports" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BugReports />
                  </Suspense>
                } 
              />
              <Route 
                path="time-logs" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <TimeLogs />
                  </Suspense>
                } 
              />
              <Route 
                path="working-hours" 
                element={
                  <ProtectedRoute requiredRoles={["admin","project_manager"]}>
                    <Suspense fallback={<LoadingSpinner />}>
                      <WorkingHoursManagement />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route
                path="holidays"
                element={
                  <ProtectedRoute requiredRoles={["admin","project_manager"]}>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Holidays />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="time-off"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <TimeOffRequests />
                  </Suspense>
                }
              />
              <Route
                path="my-calendar"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <PersonalCalendar />
                  </Suspense>
                }
              />
              <Route 
                path="milestones" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Milestones />
                  </Suspense>
                } 
              />
              <Route 
                path="reports" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Reports />
                  </Suspense>
                } 
              />
              <Route 
                path="planner" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Planner />
                  </Suspense>
                } 
              />
              <Route path="" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;