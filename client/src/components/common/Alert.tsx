import { useEffect } from "react";
import { useAlert } from "../../contexts/AlertContext";

/**
 * Alert component that displays alert messages.
 */
function Alert() {
  const { alertInfo, closeAlert } = useAlert();

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        closeAlert();
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [alertInfo.show, closeAlert]);

  if (!alertInfo.show) return null;

  const alertStyles = {
    success: "bg-green-100 border-green-500 text-green-800",
    error: "bg-red-100 border-red-500 text-red-800",
    info: "bg-blue-100 border-blue-500 text-blue-800",
  }[alertInfo.type];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <div
        className={`flex items-center justify-center w-full max-w-xl p-4 rounded-lg shadow-lg border-l-4 ${alertStyles}`}
      >
        <div className="text-sm">{alertInfo.message}</div>
        <button
          type="button"
          onClick={closeAlert}
          className="ml-auto bg-transparent text-gray-500 hover:text-gray-700 p-1 rounded-full"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Alert;
