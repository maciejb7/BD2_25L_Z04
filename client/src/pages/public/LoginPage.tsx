import LoginForm from "../../components/forms/LoginForm";
import Background from "../../components/common/Background";
import Footer from "../../components/common/Footer";
import TopBar from "../../components/common/TopBar";
import { getTopBarOptions } from "../../constants/topBarOptions";

function LoginPage() {
  return (
    <div>
      <Background>
        <TopBar options={getTopBarOptions(["Strona Główna"])} />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoginForm />
        </div>
        <Footer />
      </Background>
    </div>
  );
}

export default LoginPage;
