import React, { createContext, useState, ReactNode } from "react";

export type AlertType = "success" | "error" | "info";

interface AlertContextProps {
  showAlert: (message: string, type: AlertType) => void;
  closeAlert: () => void;
  alertInfo: {
    show: boolean;
    type: AlertType;
    message: string;
  };
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export function useAlert() {
  const context = React.useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "info" as AlertType,
    message: "",
  });

  const showAlert = (message: string, type: AlertType) => {
    setAlertInfo({ show: true, type, message });
  };

  const closeAlert = () => {
    setAlertInfo({ ...alertInfo, show: false });
  };

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert, alertInfo }}>
      {children}
    </AlertContext.Provider>
  );
}
