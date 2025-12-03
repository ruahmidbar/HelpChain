import React from "react";

function Badge({ className, variant, ...props }) {
  // עיצוב בסיסי לתגית
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  // צבעים פשוטים (אפשר להרחיב אם צריך)
  const variants = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
    outline: "text-gray-950 border-gray-200"
  };

  // בחירת העיצוב לפי ה-variant שהתקבל (או ברירת מחדל)
  const variantStyles = variants[variant] || variants.default;
  
  // שילוב המחלקות (Classes)
  const combinedClassName = `${baseStyles} ${variantStyles} ${className || ""}`;

  return (
    <div className={combinedClassName} {...props} />
  );
}

// הנה השורה הקריטית שפותרת את השגיאה:
export default Badge;