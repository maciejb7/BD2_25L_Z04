import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashBoardPage";
import NotFoundPage from "../pages/NotFoundPage";

function PrivateRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default PrivateRouter;
