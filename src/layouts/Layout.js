import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";
import { 
  Home, 
  MessageCircle, 
  Calendar,
  Menu,
  User,
  LogOut,
  Users,
  ShieldAlert,
  BarChart3,
  Bell
} from "lucide-react";
import Button from "../Components/ui/button"; 
import Badge from "../Components/ui/badge";   

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("student");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // נתונים זמניים - בהמשך נחבר למסד הנתונים
  const notificationsCount = 0; 
  const unreadChatCount = 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/"); 
      } else {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            setUserRole(userData.role || "student");
          } else {
            setUser({ 
                first_name: firebaseUser.displayName?.split(" ")[0] || "אורח",
                last_name: "",
                email: firebaseUser.email,
                rank: "הלפר מתחיל",
                points: 0
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // --- תיקון התפריט לפי הבקשה ---
  const navigationItems = [
    { 
      title: "דף הבית", 
      url: "/dashboard", 
      icon: Home 
    },
    { 
      title: "הודעות", // הכוונה להתראות מערכת (בקשות/אישורים)
      url: "/notifications", // מוביל לקובץ Notifications.jsx
      icon: Bell, 
      badge: notificationsCount 
    },
    { 
      title: "צ'אט", // הכוונה לשיחות חופשיות
      url: "/chat", // מוביל לקובץ Chat.jsx
      icon: MessageCircle, 
      badge: unreadChatCount 
    },
    { 
      title: "היומן שלי", 
      url: "/calendar", 
      icon: Calendar 
    },
  ];

  if (userRole === 'admin' || userRole === 'school_admin') {
    navigationItems.push({ title: "ניהול משתמשים", url: "/admin/users", icon: Users });
    navigationItems.push({ title: "ניהול תוכן", url: "/admin/content", icon: ShieldAlert });
    navigationItems.push({ title: "דוחות וניתוח", url: "/admin/reports", icon: BarChart3 });
  }

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return { label: 'מנהל מערכת', color: 'text-red-600 bg-red-50' };
      case 'school_admin': return { label: 'אדמין בית ספרי', color: 'text-orange-600 bg-orange-50' };
      case 'staff': return { label: 'צוות ביה"ס', color: 'text-purple-600 bg-purple-50' };
      default: return { label: 'תלמיד', color: 'text-blue-600 bg-blue-50' };
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען נתונים...</div>;

  const roleInfo = getRoleBadge(userRole);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-72 bg-white/95 backdrop-blur-sm border-l border-purple-200 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        flex flex-col shadow-xl lg:shadow-none
      `}>
        
        <div className="border-b border-purple-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-xl">🤝</span>
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-xl bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HelpChain
                </h2>
                
                {user ? (
                  <div className="flex flex-col mt-1">
                    <span className="text-sm font-bold text-gray-800 truncate">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-[10px] text-gray-500 truncate mb-1" title={user.email}>
                      {user.email}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">ביחד נצליח!</p>
                )}
                
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${location.pathname === item.url 
                  ? 'bg-purple-100 text-purple-700 shadow-sm font-bold' 
                  : 'hover:bg-purple-50 text-gray-700'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.title}</span>
              {item.badge > 0 && (
                <Badge className="bg-red-500 text-white hover:bg-red-600">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="border-t border-purple-200 p-4 bg-purple-50/30">
            <div className="bg-white rounded-xl border border-purple-100 shadow-sm p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">דרגה</span>
                <Badge className="bg-gradient-to-l from-yellow-400 to-orange-400 text-white border-0 text-xs px-2 py-0.5">
                  {user.rank || "הלפר"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">נקודות</span>
                <span className="font-bold text-md bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user.points || 0}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 text-gray-600 text-sm h-9"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </Button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-purple-200 px-4 py-3 sticky top-0 z-30 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HelpChain
                </h1>
                {user && <span className="text-xs text-gray-500">({user.first_name})</span>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-purple-700" />
            </Button>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}