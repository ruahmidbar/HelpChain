import React, { useState, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react"; 

// יצירת Context כדי שהחלקים השונים יוכלו לדבר אחד עם השני
const SelectContext = createContext(null);

export const Select = ({ children, onValueChange, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);

  const handleSelect = (newValue) => {
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value, handleSelect, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className }) => {
  const { open, setOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder }) => {
  const { value } = useContext(SelectContext);
  
  // תרגום הערכים לתצוגה בעברית (אופציונלי, אפשר להרחיב)
  const getDisplayValue = () => {
      if (value === "father") return "אבא";
      if (value === "mother") return "אמא";
      if (value === "other") return "אפוטרופוס אחר";
      return value;
  };

  return (
    <span className="block truncate text-right w-full">
      {value ? getDisplayValue() : placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className }) => {
  const { open } = useContext(SelectContext);
  if (!open) return null;

  return (
    <div className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white text-gray-950 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}>
      <div className="p-1">{children}</div>
    </div>
  );
};

export const SelectItem = ({ value, children, className }) => {
  const { handleSelect } = useContext(SelectContext);
  return (
    <div
      onClick={() => handleSelect(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
    >
      <span className="font-medium w-full text-right">{children}</span>
    </div>
  );
};