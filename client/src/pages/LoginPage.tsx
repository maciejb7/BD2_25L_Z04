import LoginForm from "../components/auth/LoginForm";
import TopBar from "../components/common/TopBar";

const topBarOptions = [{ name: "Strona Główna", link: "/" }];

function LoginPage() {
  return (
    <div>
      <TopBar options={topBarOptions} />
      <LoginForm />
    </div>
  );
}

export default LoginPage;
