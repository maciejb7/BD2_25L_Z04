import { useEffect, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { changeUserInfoField, getUserFromAPI } from "../../api/api.user";

interface AccountFieldProps {
  label: string;
  name: string;
  value: string;
  onConfirm: (name: string, value: string) => void;
  isLoading: boolean;
  editable?: boolean;
  type?: "text" | "date" | "select";
  options?: string[];
}

export default function AccountField({
  label,
  name,
  value,
  onConfirm,
  isLoading,
  type = "text",
  options = [],
  editable = true,
}: AccountFieldProps) {
  const [editMode, setEditMode] = useState(false);
  const [fieldValue, setFieldValue] = useState<string>(value);
  const { showAlert } = useAlert();

  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  const handleCancel = () => {
    setFieldValue(value);
    setEditMode(false);
  };

  const handleConfirm = async () => {
    if (fieldValue === value) {
      showAlert("Nie wprowadzono żadnych zmian.", "info");
      setEditMode(false);
      return;
    }

    try {
      const result = await changeUserInfoField(name, fieldValue);
      await getUserFromAPI();
      onConfirm(name, fieldValue);
      showAlert(result.message, "success");
    } catch (error: any) {
      showAlert(error.message, "error");
      setFieldValue(value);
    } finally {
      setEditMode(false);
    }
  };

  if (value === "") {
    return null;
  }

  return (
    <div className="grid grid-cols-[max-content,1fr] items-center w-full gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
      <label className="font-medium text-gray-700 whitespace-nowrap">
        {label}:
      </label>

      {editMode ? (
        <div className="flex items-center gap-3 w-full min-w-0">
          {type === "select" ? (
            <select
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="p-2 rounded-full text-white bg-green-500 hover:bg-green-600 transition disabled:opacity-50 shadow-sm hover:-translate-y-px shrink-0"
            title="Zatwierdź"
          >
            <i className="fas fa-check" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50 shadow-sm hover:-translate-y-px shrink-0"
            title="Anuluj"
          >
            <i className="fas fa-times" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full">
          <span className="text-gray-800 truncate">
            {!isLoading ? value : "Ładowanie..."}
          </span>
          {editable && (
            <button
              onClick={() => setEditMode(true)}
              disabled={isLoading}
              className="p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-50 shadow-sm hover:-translate-y-px shrink-0"
              title="Edytuj"
            >
              <i className="fas fa-edit" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
