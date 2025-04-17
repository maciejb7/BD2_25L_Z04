import RegisterForm from "../components/auth/RegisterForm";
import TopBar from "../components/common/TopBar";

const topBarOptions = [{ name: "Strona Główna", link: "/" }];

function RegisterPage() {
  return (
    <div>
      <TopBar options={topBarOptions}></TopBar>
      <RegisterForm></RegisterForm>
    </div>
  );
}

export default RegisterPage;
