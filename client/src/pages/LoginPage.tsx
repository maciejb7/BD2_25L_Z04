import LoginForm from "../components/auth/LoginForm";
import Footer from "../components/common/Footer";
import Background from "../components/common/Background";
import TopBar from "../components/common/TopBar";

const topBarOptions = [{ name: "Strona Główna", link: "/" }];

function LoginPage() {
  return (
    <div>
      <TopBar options={topBarOptions} />
      <Background>
        <div className="flex flex-col items-center justify-center h-screen">
          <LoginForm />
        </div>
      </Background>
      <Footer />
    </div>
  );
}

export default LoginPage;
