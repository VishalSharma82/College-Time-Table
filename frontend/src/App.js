import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { AuthContext } from "./context/AuthContext";
import CreateGroup from "./pages/groups/CreateGroup";
import JoinGroup from "./pages/groups/JoinGroup";
import GroupPage from "./pages/groups/GroupPage";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
        <Route
          path="/groups/create"
          element={user ? <CreateGroup /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups/join"
          element={user ? <JoinGroup /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups/:id"
          element={user ? <GroupPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
