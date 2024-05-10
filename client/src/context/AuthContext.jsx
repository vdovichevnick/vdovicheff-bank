import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { Circle } from "react-preloaders";
import config from "../config";
import style from "../app.module.scss";
import showErrorMessage from "../utils/showErrorMessage";
import inMemoryJWT from "../services/inMemoryJWT.js";
import InMemoryJWT from "../services/inMemoryJWT.js";

export const AuthClient = axios.create({
    baseURL: `${config.API_URL}/auth`,
    withCredentials: true,
})

const ResourceClient = axios.create({
    baseURL: `${config.API_URL}/resource`,
})

ResourceClient.interceptors.request.use(
    (config) => {
        const accessToken = inMemoryJWT.getToken();

        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error)  => {
        Promise.reject(error);
    }
);

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isUserLogged, setIsUserLogged] = useState(false); // добавить доступ по ролям
  const [data, setData] = useState();

  const handleFetchProtected = () => { // обновление баланса
      ResourceClient.get("/balance").then((res) => {
          setData(res.data);
      }).catch(showErrorMessage);
  };

    const handleTransfer = () => { // обновление баланса
        ResourceClient.get("/transfer").then((res) => {
            setData(res.data);
        }).catch(showErrorMessage);
    };
    const handleTransferNew = (id, amount) => {
        ResourceClient.post("/transferNew", { id, amount })
            .then((res) => {
                setData(res.data);
            })
            .catch(showErrorMessage);
    };



  const handleLogOut = () => {
      AuthClient.post("/logout").then(() => {
          InMemoryJWT.deleteToken();
          setIsUserLogged(false)
      }).catch(showErrorMessage);
  };

  const handleSignUp = (data) => {
      AuthClient.post("/sign-up", data).then((res) => {
          const {accessToken, accessTokenExpiration} = res.data;
          inMemoryJWT.setToken(accessToken, accessTokenExpiration);
          setIsUserLogged(true);
      }).catch(showErrorMessage);
  };

  const handleSignIn = (data) => {
      AuthClient.post("/sign-in", data).then((res) => {
          const {accessToken, accessTokenExpiration} = res.data;
          inMemoryJWT.setToken(accessToken, accessTokenExpiration);
          setIsUserLogged(true);
      }).catch(showErrorMessage);
  };

  useEffect(() => {
      AuthClient.post("/refresh").then((res) => {
          const {accessToken, accessTokenExpiration} = res.data;
          inMemoryJWT.setToken(accessToken, accessTokenExpiration)

          setIsAppReady(true);
          setIsUserLogged(true)
      }).catch(() => {
          setIsAppReady(true);
          setIsUserLogged(false);
      });
  }, []);

    useEffect(() => {
        const handlePersistedLogOut = (event) => {
          if (event.key === config.LOGOUT_STORAGE_KEY){
              inMemoryJWT.deleteToken();
              setIsUserLogged(false);
          }
        };

        window.addEventListener("storage", handlePersistedLogOut);

        return () => {
            window.removeEventListener("storage", handlePersistedLogOut);
        }
    }, []);

  return (
    <AuthContext.Provider
      value={{
        data,
        handleFetchProtected,
        handleTransfer,
        handleTransferNew,
        handleSignUp,
        handleSignIn,
        handleLogOut,
        isUserLogged,
        isAppReady,
      }}
    >
      {isAppReady ? (
          children
      ) : (
          <div className={style.centered}>
              <Circle />
          </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
