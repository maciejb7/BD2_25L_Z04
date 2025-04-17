import TopBar from "../components/common/TopBar";

const topBarOptions = [{ name: "Strona Główna", link: "/" }];

function NotFoundPage() {
  return (
    <div>
      <TopBar options={topBarOptions}></TopBar>
      <h1>404 Not Found</h1>
    </div>
  );
}

export default NotFoundPage;
