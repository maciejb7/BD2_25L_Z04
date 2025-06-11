import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/private/DashBoardPage";
import NotFoundPage from "../pages/NotFoundPage";
import AccountSettings from "../pages/private/AccountSettings";
import { isUserAdminByStorage } from "../utils/userAuthentication";
import UsersListPage from "../pages/admin/UsersListPage";
import AdminAccountSettings from "../pages/admin/AdminAccountSettings";

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
        <>
          <Route path="/users-management" element={<UsersListPage />} />
          <Route
            path="/account-settings/:userId"
            element={<AdminAccountSettings />}
          />
        </>
      )}
    </Routes>
  );
}

export default PrivateRouter;
