import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/private/DashBoardPage";
import NotFoundPage from "../pages/NotFoundPage";
import AccountSettings from "../pages/private/AccountSettings";
import HobbyPage from "../pages/private/HobbysPage";
import MediaPage from "../pages/private/MediaPage";

function PrivateRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/hobbies" element={<HobbyPage />} />
      <Route path="/media" element={< MediaPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default PrivateRouter;
