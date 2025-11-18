import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, 
  MessageCircle, 
  Calendar,
  Menu,
  User,
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    checkAuth();
  }, [location]);

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: () => user ? base44.entities.Message.filter({ to_user_id: user.id, is_read: false }) : [],
    enabled: !!user,
    initialData: [],
  });

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Landing"));
  };

  const navigationItems = [
    {
      title: "דף הבית",
      url: createPageUrl("Dashboard"),
      icon: Home,
    },
    {
      title: "ההודעות שלי",
      url: createPageUrl("Messages"),
      icon: MessageCircle,
      badge: unreadMessages.length,
    },
    {
      title: "היומן שלי",
      url: createPageUrl("Calendar"),
      icon: Calendar,
    },
  ];

  if (!isAuthenticated && currentPageName !== "Landing" && currentPageName !== "Register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">HelpChain</h1>
          <p className="mb-6 text-gray-600">נא להתחבר כדי להמשיך</p>
          <Button onClick={() => navigate(createPageUrl("Landing"))}>
            חזרה לדף הבית
          </Button>
        </div>
      </div>
    );
  }

  if (currentPageName === "Landing" || currentPageName === "Register") {
    return children;
  }

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
        flex flex-col
      `}>
        <div className="border-b border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🤝</span>
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HelpChain
                </h2>
                <p className="text-xs text-gray-500">ביחד נצליח!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200
                ${location.pathname === item.url 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'hover:bg-purple-50 text-gray-700'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium flex-1">{item.title}</span>
              {item.badge > 0 && (
                <Badge className="bg-red-500 text-white">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="border-t border-purple-200 p-4">
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">הדרגה שלך</span>
                <Badge className="bg-gradient-to-l from-yellow-400 to-orange-400 text-white border-0">
                  {user.rank || "הלפר"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">נקודות</span>
                <span className="font-bold text-lg bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user.points || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.full_name || "משתמש"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </Button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-purple-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HelpChain
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}