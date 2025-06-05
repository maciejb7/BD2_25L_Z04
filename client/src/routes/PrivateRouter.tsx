import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/private/DashBoardPage";
import NotFoundPage from "../pages/NotFoundPage";
import AccountSettings from "../pages/private/AccountSettings";
import { isUserAdminByStorage } from "../utils/userAuthentication";
import AdminPanelPage from "../pages/admin/AdminPanelPage";

function PrivateRouter() {
  const isUserAdmin = isUserAdminByStorage();

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
      {isUserAdmin && (
        <Route path="/admin-panel" element={<AdminPanelPage />} />
      )}
    </Routes>
  );
}

export default PrivateRouter;
