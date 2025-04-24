import { AlertProvider } from "./contexts/AlertContext";
import Alert from "./components/common/Alert";
import { BrowserRouter } from "react-router-dom";
import AuthHandler from "./components/auth/AuthHandler";
import RouterController from "./routes/RouterController";

function App() {
  return (
    <AlertProvider>
      <Alert />
      <BrowserRouter>
        <AuthHandler />
        <RouterController />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
