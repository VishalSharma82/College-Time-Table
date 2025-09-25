import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { AuthContext } from "./context/AuthContext";
import CreateGroup from "./pages/groups/CreateGroup";
import JoinGroup from "./pages/groups/JoinGroup";
import GroupPage from "./pages/groups/GroupPage";
import AdminGroupDetails from "./pages/AdminGroupDetails";
import TimetableWizard from "./pages/TimetableWizard"; // Import the new component

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Group Routes */}
        <Route
          path="/groups/create"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CreateGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/join"
          element={
            <ProtectedRoute roles={["user"]}>
              <JoinGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              {user?.role === "admin" ? <AdminGroupDetails user={user} /> : <GroupPage />}
            </ProtectedRoute>
          }
        />
        
        {/* New Route for Timetable Wizard */}
        <Route
          path="/groups/:id/timetable-wizard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <TimetableWizard />
            </ProtectedRoute>
          }
        />

        {/* Catch All */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;