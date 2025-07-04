import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/private/DashBoardPage";
import NotFoundPage from "../pages/NotFoundPage";
import AccountSettings from "../pages/private/AccountSettings";
import { isUserAdminByStorage } from "../utils/userAuthentication";
import UsersListPage from "../pages/admin/UsersListPage";
import AdminAccountSettings from "../pages/admin/AdminAccountSettings";
import QuestionsPage from "../pages/private/QuestionsPage";
import ExplorePage from "../pages/private/ExplorePage";
import HobbyPage from "../pages/private/HobbysPage";
import MediaPage from "../pages/private/MoviePage";
import BooksPage from "../pages/private/BookPage";
import MusicPage from "../pages/private/MusicPage";

function PrivateRouter() {
  const isUserAdmin = isUserAdminByStorage();

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/hobbies" element={<HobbyPage />} />
      <Route path="/media" element={< MediaPage />} />
      <Route path="/music" element={< MusicPage />} />
      <Route path="/book" element={< BooksPage />} />
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
