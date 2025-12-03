import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

// 1. המעטפת הראשית
export function Dialog({ children, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const handleOpenChange = (value) => {
    setIsOpen(value);
    if (onOpenChange) onOpenChange(value);
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open: isOpen, onOpenChange: handleOpenChange });
        }
        return child;
      })}
    </>
  );
}

// 2. הכפתור שפותח
export function DialogTrigger({ children, asChild, onClick, onOpenChange, ...props }) {
  return (
    <div onClick={(e) => {
        if (onClick) onClick(e);
        if (onOpenChange) onOpenChange(true);
    }} className="inline-block" {...props}>
      {children}
    </div>
  );
}

// 3. התוכן (החלון הקופץ)
export function DialogContent({ children, open, onOpenChange, className = "" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative bg-white w-full max-w-lg rounded-xl shadow-2xl border p-6 ${className}`} dir="rtl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

// 4. כותרת עליונה
export function DialogHeader({ children, className = "" }) {
  return <div className={`flex flex-col space-y-1.5 text-center sm:text-right mb-4 ${className}`}>{children}</div>;
}

// 5. כותרת ראשית
export function DialogTitle({ children, className = "" }) {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
}

// 6. תיאור
export function DialogDescription({ children, className = "" }) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}