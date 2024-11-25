import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from './pages/Register';
import CreateProject from './pages/CreateProjects';
import Tasks from './pages/TaskPage';
import Subscription from './pages/Subscription';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/projects/:projectId/tasks" element={<Tasks />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
