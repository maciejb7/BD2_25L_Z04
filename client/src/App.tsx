import { AlertProvider } from "./contexts/AlertContext";
import Alert from "./components/common/Alert";
import { BrowserRouter } from "react-router-dom";
import RouterController from "./routes/RouterController";
import Redicretor from "./components/common/Redirector";

function App() {
  return (
    <AlertProvider>
      <Alert />
      <BrowserRouter>
        <Redicretor />
        <RouterController />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
