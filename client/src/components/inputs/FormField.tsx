interface FormFieldProps {
  label: string;
  type?: "text" | "password" | "email" | "date";
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

function FormField({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
}: FormFieldProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        max={
          type === "date" ? new Date().toISOString().split("T")[0] : undefined
        }
      />
    </div>
  );
}

export default FormField;
