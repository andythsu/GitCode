import React from "react";
import { createRoot } from "react-dom/client";
import Auth from "./Auth";
import { Welcome } from "./Welcome";

const auth = new Auth();

type PopupProps = {
  auth: Auth;
}

const Popup = ({auth}: PopupProps) => {
  const accessToken = auth.getAccessToken();
  return (
    <>
      {
        accessToken
        ? <Welcome></Welcome>
        : <button onClick={() => auth.authWithGithub()}>Authenticate with Github</button>
      }
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup auth={auth}/>
  </React.StrictMode>
);
