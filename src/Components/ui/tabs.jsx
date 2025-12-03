import React, { createContext, useContext, useState } from "react";

// יצירת הקשר (Context) לניהול המצב הפעיל בין הרכיבים
const TabsContext = createContext();

// 1. המעטפת הראשית
export function Tabs({ defaultValue, children, className = "" }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} dir="rtl">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// 2. רשימת הכפתורים (הסרגל העליון)
export function TabsList({ children, className = "" }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  );
}

// 3. הכפתור הבודד (Trigger)
export function TabsTrigger({ value, children, className = "" }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive 
          ? "bg-white text-gray-950 shadow-sm font-bold" 
          : "hover:bg-gray-200/50 hover:text-gray-700"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// 4. התוכן שמוצג (Content)
export function TabsContent({ value, children, className = "" }) {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 animate-in fade-in-50 duration-300 ${className}`}>
      {children}
    </div>
  );
}