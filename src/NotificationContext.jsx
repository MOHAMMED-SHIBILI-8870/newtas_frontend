import { createContext, useContext } from "react";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  const success = (message) => {
    toast.success(message);
  };

  const error = (message) => {
    toast.error(message);
  };

  const loading = (message) => {
    return toast.loading(message);
  };

  const dismiss = (id) => {
    toast.dismiss(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        success,
        error,
        loading,
        dismiss,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};