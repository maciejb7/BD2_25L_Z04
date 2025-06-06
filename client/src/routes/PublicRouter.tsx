import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";
import ActivateAccountPage from "../pages/public/ActivateAccountPage";

function PublicRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/activate-account/:linkId"
        element={<ActivateAccountPage />}
      />
      <Route path="/reset-password/:linkId" element={<ResetPasswordPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default PublicRouter;
