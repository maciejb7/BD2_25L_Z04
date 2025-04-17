import { BrowserRouter } from "react-router-dom";
import PublicRouter from "./routes/PublicRouter";
import { AlertProvider } from "./contexts/AlertContext";
import Alert from "./components/common/Alert";

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
