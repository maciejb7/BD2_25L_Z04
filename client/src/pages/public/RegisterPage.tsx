import RegisterForm from "../../components/forms/RegisterForm";
import Background from "../../components/common/Background";
import Footer from "../../components/common/Footer";
import TopBar from "../../components/common/TopBar";
import { getTopBarOptions } from "../../constants/topBarOptions";

function RegisterPage() {
  return (
    <div>
      <Background>
        <TopBar options={getTopBarOptions(["Strona Główna"])} />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <RegisterForm></RegisterForm>
        </div>
        <Footer />
      </Background>
    </div>
  );
}

export default RegisterPage;
