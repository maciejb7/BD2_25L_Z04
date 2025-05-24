import RegisterForm from "../components/auth/RegisterForm";
import Footer from "../components/common/Footer";
import Background from "../components/common/Background";
import TopBar from "../components/common/TopBar";

const topBarOptions = [{ name: "Strona Główna", link: "/" }];

function RegisterPage() {
  return (
    <div>
      <TopBar options={topBarOptions}></TopBar>
      <Background>
        <div className="flex flex-col items-center justify-center h-screen">
          <RegisterForm></RegisterForm>
        </div>
      </Background>
      <Footer />
    </div>
  );
}

export default RegisterPage;
