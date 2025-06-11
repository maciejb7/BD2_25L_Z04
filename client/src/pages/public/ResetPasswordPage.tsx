import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checkIfPasswordResetLinkExists } from "../../api/api.user";
import TopBar from "../../components/common/TopBar";
import Footer from "../../components/common/Footer";
import Background from "../../components/common/Background";
import { getTopBarOptions } from "../../constants/topBarOptions";
import ResetPasswordForm from "../../components/forms/ResetPasswordForm";

function ResetPasswordPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLink = async () => {
      try {
        await checkIfPasswordResetLinkExists(linkId!);
      } catch {
        navigate("/");
        return;
      }
    };
    verifyLink();
  }, []);

  return (
    <div>
      <Background>
        <TopBar options={getTopBarOptions(["Strona Główna"])} />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ResetPasswordForm linkId={linkId!} />
        </div>
        <Footer />
      </Background>
    </div>
  );
}

export default ResetPasswordPage;
