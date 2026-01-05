import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Gyms from './pages/Gyms';
import Exercises from './pages/Exercises';
import Routines from './pages/Routines';
import RoutineBuilder from './pages/RoutineBuilder';
import Workouts from './pages/Workouts';
import WorkoutLogger from './pages/WorkoutLogger';
import Diets from './pages/Diets';
import DietBuilder from './pages/DietBuilder';
import MainLayout from './layouts/MainLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Users />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/gyms"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Gyms />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/exercises"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Exercises />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/routines"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Routines />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/routines/new"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <RoutineBuilder />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/routines/:id"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <RoutineBuilder />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/routines/:id/edit"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <RoutineBuilder />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/workouts"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Workouts />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/workouts/new"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <WorkoutLogger />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/diets"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Diets />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/diets/:id"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <DietBuilder />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Router>
          </ToastProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;


