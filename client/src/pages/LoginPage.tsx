import LoginForm from "../components/auth/LoginForm";
import Footer from "../components/common/Footer";
import MainBackground from "../components/common/MainBackground";
import TopBar from "../components/common/TopBar";

const topBarOptions = [{ name: "Strona Główna", link: "/" }];

function LoginPage() {
  return (
    <div>
      <TopBar options={topBarOptions} />
      <MainBackground>
        <div className="flex flex-col items-center justify-center h-screen">
          <LoginForm />
        </div>
      </MainBackground>
      <Footer />
    </div>
  );
}

export default LoginPage;
