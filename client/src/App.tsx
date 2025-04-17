import { BrowserRouter } from "react-router-dom";
import PublicRouter from "./routes/PublicRouter";

function App() {
  return (
    <BrowserRouter>
      <PublicRouter />
    </BrowserRouter>
  );
}

export default App;
