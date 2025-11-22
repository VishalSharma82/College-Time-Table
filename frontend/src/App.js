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

  // Check if user role is included in required roles
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
        
        {/* Protected Dashboard (Any logged-in user) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Group Creation (Admin only) */}
        <Route
          path="/groups/create"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CreateGroup />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Group Joining (Any user role, assuming "user" is not a formal role name but we leave it as is) */}
        <Route
          path="/groups/join"
          element={
            // Note: If you want all non-admin roles (faculty, student) to join, use roles={["faculty", "student"]}
            // If you intend for *any* logged-in user to join, you don't need the roles prop here.
            <ProtectedRoute> 
              <JoinGroup />
            </ProtectedRoute>
          }
        />
        
        {/* PRIMARY GROUP DETAIL ROUTE (Handles Admin/User view based on role) */}
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              {user?.role === "admin" ?
                <AdminGroupDetails user={user} /> : <GroupPage />}
            </ProtectedRoute>
          }
        />

        {/* TIMETABLE WIZARD ROUTE (Admin only, requires owner check inside the component) */}
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