import { useEffect, useState } from "react";
import PrivateRouter from "./PrivateRouter";
import PublicRouter from "./PublicRouter";
import { getAuthObserver } from "../utils/AuthObserver";
import {
  isUserAuthenticated,
  isUserAuthenticatedByStorage,
} from "../utils/userAuthentication";

function RouterController() {
  const [authenticated, setAuthenticated] = useState(
    isUserAuthenticatedByStorage(),
  );

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isUserAuthenticated();
      setAuthenticated(result);
    };

    checkAuth();

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
