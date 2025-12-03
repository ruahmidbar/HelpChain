import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Firebase
import { auth, db } from "../firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

// רכיבים UI - וודא שהאותיות הגדולות/קטנות תואמות לתיקיות שלך
import Button from "../Components/ui/button";
import { Card, CardContent } from "../Components/ui/card";

// איקונים
import { HandHeart, HelpCircle, Users, List, LogOut, Award } from "lucide-react";

// אנימציות
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // בדיקה בסיסית אם יש משתמש מחובר
      if (!auth.currentUser) {
        // הראוטר ב-App כבר יטפל בזה, אבל ליתר ביטחון:
        return;
      }

      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // רשימת הפעולות עם הקישורים המתוקנים (מתחילים ב-/)
  const myActions = [
    {
      title: "אני מבקש עזרה",
      description: "מצא תלמיד שיעזור לך בנושא שאתה צריך",
      icon: HelpCircle,
      color: "from-blue-500 to-cyan-500",
      hoverColor: "hover:from-blue-600 hover:to-cyan-600",
      path: "/request-help" // <-- תוקן
    },
    {
      title: "אני מוכן לעזור",
      description: "הציע עזרה לתלמידים אחרים וצבור נקודות",
      icon: HandHeart,
      color: "from-purple-500 to-pink-500",
      hoverColor: "hover:from-purple-600 hover:to-pink-600",
      path: "/offer-help" // <-- תוקן
    }
  ];

  const browseLists = [
    {
      title: "רשימת תלמידים שמבקשים עזרה",
      description: "ראה מי צריך עזרה והציע לו את השירותים שלך",
      icon: Users,
      color: "from-orange-500 to-red-500",
      hoverColor: "hover:from-orange-600 hover:to-red-600",
      path: "/browse-requests" // <-- תוקן
    },
    {
      title: "רשימת תלמידים שמציעים עזרה",
      description: "דפדף בתלמידים שמציעים עזרה ובקש מהם",
      icon: List,
      color: "from-green-500 to-teal-500",
      hoverColor: "hover:from-green-600 hover:to-teal-600",
      path: "/browse-offers" // <-- תוקן
    }
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  // אם סיימנו לטעון ואין יוזר, לא נציג כלום (הרידיירקט יקרה ב-App)
  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                שלום, {user.first_name || "תלמיד"}! 👋
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-3">מה תרצה לעשות היום?</p>
            
            <div className="bg-gradient-to-l from-blue-50 to-purple-50 border border-purple-200 rounded-2xl p-3 max-w-2xl mx-auto shadow-sm">
              <p className="text-sm font-medium text-purple-900 flex items-center justify-center gap-2">
                <span>⭐</span> 
                פלטפורמה לעזרה הדדית בלימודים - ללא תשלום 
                <span>⭐</span>
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* אזור פעולות */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3 pr-2 border-r-4 border-blue-500 mr-1">הפעולות שלי</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {myActions.map((action, index) => (
                  <motion.div key={action.title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm h-full"
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent className="p-0 h-full">
                        <div className={`bg-gradient-to-br ${action.color} ${action.hoverColor} p-5 h-full flex items-start gap-4 transition-all duration-300`}>
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <action.icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* אזור רשימות */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3 pr-2 border-r-4 border-orange-500 mr-1">לוחות וחיפוש</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {browseLists.map((list, index) => (
                  <motion.div key={list.title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm h-full"
                      onClick={() => navigate(list.path)}
                    >
                      <CardContent className="p-0 h-full">
                        <div className={`bg-gradient-to-br ${list.color} ${list.hoverColor} p-5 h-full flex items-start gap-4 transition-all duration-300`}>
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <list.icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{list.title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed">{list.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* כרטיס פרופיל תחתון */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-8">
            <Card className="bg-white border-yellow-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-50 to-transparent opacity-50"></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-right flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-500 bg-yellow-100 p-1.5 rounded-full" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">הפרופיל שלך</h3>
                        <p className="text-sm text-gray-600">המשך לצבור נקודות!</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 bg-gray-50 px-6 py-2 rounded-xl border border-gray-100">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 font-medium mb-1">נקודות</div>
                      <div className="text-2xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {user.points || 0}
                      </div>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 font-medium mb-1">דרגה</div>
                      <div className="text-lg font-bold text-yellow-600">{user.rank || "הלפר"}</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100 h-9 px-3">
                    <LogOut className="w-4 h-4 ml-2" />
                    יציאה
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}