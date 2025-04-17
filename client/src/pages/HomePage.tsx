import TopBar from "../components/common/TopBar";

const topBarOptions = [
  { name: "Logowanie", link: "/login" },
  { name: "Rejestracja", link: "/register" },
];

function HomePage() {
  return (
    <div>
      <TopBar options={topBarOptions} />
    </div>
  );
}

export default HomePage;
