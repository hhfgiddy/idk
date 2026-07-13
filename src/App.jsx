import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Registration from "./pages/Registration.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/Chat.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { notifyVisit } from "./utils/visitorNotify";

const App = () => {
  useEffect(() => {
    notifyVisit();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Registration />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["sakina"]}>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={["sakina", "me"]}>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
