import PublicRouter from "./routes/PublicRouter";
import { AlertProvider } from "./contexts/AlertContext";
import Alert from "./components/common/Alert";
import { BrowserRouter } from "react-router-dom";

function App() {

  return (
    <AlertProvider>
      <Alert />
      <BrowserRouter>
        <PublicRouter />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
