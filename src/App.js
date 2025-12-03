import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { Toaster } from "sonner";

// Layout
import Layout from "./layouts/Layout"; 

// דפים ציבוריים
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login"; 
import VerifyEmail from "./pages/VerifyEmail";

// דפים פנימיים
import Dashboard from "./pages/Dashboard";
import RequestHelp from "./pages/RequestHelp";
import OfferHelp from "./pages/OfferHelp";
import BrowseRequests from "./pages/BrowseRequests";
import BrowseOffers from "./pages/BrowseOffers";
import Chat from "./pages/Chat"; // הצ'אט המרכזי
import Calendar from "./pages/Calendar";

// דפי אדמין
import UserManagement from "./pages/admin/UserManagement";
import AdminContent from "./pages/admin/AdminContent";
import Reports from "./pages/admin/Reports";

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
          <p className="text-gray-500 font-medium">טוען מערכת...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          {/* דפים ציבוריים */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* דפים מוגנים (בתוך Layout) */}
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* פעולות */}
            <Route path="/request-help" element={<RequestHelp />} />
            <Route path="/offer-help" element={<OfferHelp />} />
            <Route path="/browse-requests" element={<BrowseRequests />} />
            <Route path="/browse-offers" element={<BrowseOffers />} />

            {/* תקשורת - רק צ'אט */}
            <Route path="/chat" element={<Chat />} />
            <Route path="/messages" element={<Navigate to="/chat" />} /> {/* הפניה לצ'אט ליתר ביטחון */}

            <Route path="/calendar" element={<Calendar />} />

            {/* אדמין */}
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* ברירת מחדל */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      
      <Toaster position="top-center" richColors />
    </>
  );
}