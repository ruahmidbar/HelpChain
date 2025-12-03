import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { firebaseApp } from "../firebase/firebase";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { LogOut, User, LayoutDashboard } from "lucide-react"; // וודא שהתקנת את lucide-react, אם לא - מחק את האיקונים

const auth = getAuth(firebaseApp);

export default function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("התנתקת בהצלחה");
      navigate("/login");
    } catch (error) {
      toast.error("שגיאה בהתנתקות");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60" dir="rtl">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        
        {/* צד ימין - לוגו */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HelpChain
            </span>
          </Link>
          
          {/* תפריט ניווט למחוברים בלבד */}
          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium mr-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                דאשבורד
              </Link>
            </nav>
          )}
        </div>

        {/* צד שמאל - כפתורי פעולה */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline-block">
                שלום, {user.displayName || "משתמש"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 ml-2" />
                התנתק
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">כניסה</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  הרשמה
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}