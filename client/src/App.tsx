import PublicRouter from "./routes/PublicRouter";
import { BrowserRouter } from 'react-router-dom';
function App() {

  return (
    <BrowserRouter>
      <PublicRouter />
    </BrowserRouter>
  )
}

export default App;
