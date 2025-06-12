import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/common/TopBar";
import Footer from "../../components/common/Footer";
import Background from "../../components/common/Background";
import { getTopBarOptions } from "../../constants/topBarOptions";
import { activateAccount } from "../../api/api.auth";
import { useAlert } from "../../contexts/AlertContext";

function ActivateAccountPage() {
  const { linkId } = useParams();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    const activateAccountOnPageEnter = async () => {
      try {
        const response = await activateAccount(linkId!);
        showAlert(response.message, "success");
      } catch (error: any) {
        showAlert(error.message, "error");
      } finally {
        navigate("/login");
      }
    };
    activateAccountOnPageEnter();
  }, []);

  return (
    <div>
      <Background>
        <TopBar options={getTopBarOptions(["Strona Główna"])} />
        <div className="flex flex-col items-center justify-center min-h-screen"></div>
        <Footer />
      </Background>
    </div>
  );
}

export default ActivateAccountPage;
