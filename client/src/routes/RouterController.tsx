import { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/AuthInfo";
import PrivateRouter from "./PrivateRouter";
import PublicRouter from "./PublicRouter";
import { getAuthObserver } from "../utils/AuthObserver";

function RouterController() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    setAuthenticated(isAuthenticated());

    const loginUnsubscribe = getAuthObserver().onLogin(() => {
      setAuthenticated(true);
    });

    const logoutUnsubscribe = getAuthObserver().onLogout(() => {
      setAuthenticated(false);
    });
    return () => {
      loginUnsubscribe();
      logoutUnsubscribe();
    };
  }, []);

  return <>{authenticated ? <PrivateRouter /> : <PublicRouter />}</>;
}

export default RouterController;
