import RegisterForm from "../components/auth/RegisterForm";
import Footer from "../components/common/Footer";
import MainBackground from "../components/common/MainBackground";
import TopBar from "../components/common/TopBar";

const topBarOptions = [{ name: "Strona Główna", link: "/" }];

function RegisterPage() {
  return (
    <div>
      <TopBar options={topBarOptions}></TopBar>
      <MainBackground>
        <div className="flex flex-col items-center justify-center h-screen">
          <RegisterForm></RegisterForm>
        </div>
      </MainBackground>
      <Footer />
    </div>
  );
}

export default RegisterPage;
