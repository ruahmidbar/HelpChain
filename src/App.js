import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { Toaster } from "sonner";

// --- Layout (התפריט הצדדי) ---
import Layout from "./layouts/Layout"; 

// --- דפים ציבוריים (ללא תפריט צד) ---
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login"; 
import VerifyEmail from "./pages/VerifyEmail";

// --- דפים פנימיים (עטופים בתפריט) ---
import Dashboard from "./pages/Dashboard";
import RequestHelp from "./pages/RequestHelp";
import OfferHelp from "./pages/OfferHelp";
import BrowseRequests from "./pages/BrowseRequests";
import BrowseOffers from "./pages/BrowseOffers";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Calendar from "./pages/Calendar";

// --- דפי אדמין ---
import UserManagement from "./pages/admin/UserManagement";
import AdminContent from "./pages/admin/AdminContent";
import Reports from "./pages/admin/Reports";

// Firebase
import { firebaseApp } from "./firebase/firebase"; 
const auth = getAuth(firebaseApp);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">טוען מערכת...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          {/* --- נתיבים ציבוריים --- */}
          <Route path="/" element={<Landing />} />
          
          {/* אם משתמש מחובר מנסה להיכנס לדפי כניסה/הרשמה - נעביר אותו לדשבורד */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* --- נתיבים מוגנים (דורשים התחברות + מציגים תפריט צד) --- */}
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            
            {/* דשבורד */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* הפעולות הראשיות (מהכפתורים בדשבורד) */}
            <Route path="/request-help" element={<RequestHelp />} />
            <Route path="/offer-help" element={<OfferHelp />} />
            <Route path="/browse-requests" element={<BrowseRequests />} />
            <Route path="/browse-offers" element={<BrowseOffers />} />

            {/* תפריט צד */}
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/calendar" element={<Calendar />} />

            {/* אדמין */}
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/reports" element={<Reports />} />
            
          </Route>

          {/* ברירת מחדל: כל כתובת לא מוכרת תחזיר לדף הבית */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      
      {/* רכיב ההודעות הקופצות (Toast) - זמין בכל האפליקציה */}
      <Toaster position="top-center" richColors />
    </>
  );
}