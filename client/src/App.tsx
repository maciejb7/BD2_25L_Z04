import PublicRouter from "./routes/PublicRouter";
import { AlertProvider } from "./contexts/AlertContext";
import Alert from "./components/common/Alert";
import { BrowserRouter } from "react-router-dom";
import AuthHandler from "./components/auth/AuthHandler";

function App() {
  return (
    <AlertProvider>
      <Alert />
      <BrowserRouter>
        <AuthHandler />
        <PublicRouter />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
