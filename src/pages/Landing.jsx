import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Firebase
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";

// איקונים
import { Users, TrendingUp, MessageCircle, Calendar } from "lucide-react";

// אנימציות
import { motion } from "framer-motion";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const features = [
    { icon: Users, title: "חיבור בין תלמידים", description: "מערכת שמחברת בין תלמידים שמבקשים עזרה לבין תלמידים שרוצים לעזור." },
    { icon: TrendingUp, title: "מערכת נקודות ודרגות", description: "צברו נקודות על כל עזרה ותתקדמו בדרגות." },
    { icon: MessageCircle, title: "תקשורת פנימית", description: "מערכת הודעות פנימית נוחה בין התלמידים." },
    { icon: Calendar, title: "יומן אישי חכם", description: "תזמון פגישות אוטומטי וניהול פגישות." }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
            // ניסיון לקרוא נתונים
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);
    
            if (userSnap.exists()) {
              const data = userSnap.data();
              if (data.first_name && data.school_id) {
                navigate("/dashboard");
                return; // יציאה כדי למנוע הבהוב
              }
            }
        } catch (error) {
            console.error("שגיאה בקריאת נתונים (אולי בעיית חיבור):", error);
            // אם יש שגיאה, אנחנו לא רוצים שהמשתמש ייתקע ב"טוען" לנצח
            // פשוט נציג לו את דף הנחיתה
        }
      }
      // בכל מקרה - סיימנו לטעון
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p>מתחבר לשרת...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50" dir="rtl">
      <h1 className="text-4xl font-bold text-center mb-6 text-purple-700">HelpChain</h1>

      <div className="text-center mb-10">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg mx-2 hover:bg-blue-700 transition"
          onClick={() => navigate("/register")}
        >
          הרשמה
        </button>
        
        <button
          className="px-6 py-3 border border-gray-300 rounded-lg mx-2 hover:bg-gray-100 transition"
          onClick={() => navigate("/login")}
        >
          יש לי כבר חשבון
        </button>
      </div>

      {/* רשת הפיצ'רים */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="border rounded-xl p-6 shadow-md bg-white flex flex-col items-center text-center hover:shadow-lg transition">
              <feature.icon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- איך זה עובד? --- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 max-w-5xl mx-auto mb-12"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-purple-700">
          איך זה עובד?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-lg font-bold shadow-lg">
              1
            </div>
            <h3 className="text-lg font-bold mb-2">הירשמו לפלטפורמה</h3>
            <p className="text-gray-600">
              צרו חשבון עם פרטי בית הספר והכיתה שלכם
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-lg font-bold shadow-lg">
              2
            </div>
            <h3 className="text-lg font-bold mb-2">בחרו פעולה</h3>
            <p className="text-gray-600">
              בקשו עזרה בנושא שאתם צריכים או הציעו לעזור לאחרים
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-lg font-bold shadow-lg">
              3
            </div>
            <h3 className="text-lg font-bold mb-2">התחילו ללמוד!</h3>
            <p className="text-gray-600">
              קבעו פגישה, לכו ללמוד ביחד וצברו נקודות
            </p>
          </div>
        </div>
      </motion.div>

      {/* --- קריאה לפעולה --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="text-center py-8"
      >
        <p className="text-xl font-bold text-gray-800 mb-6">
          מוכנים להצטרף לקהילה? 🚀
        </p>
        <button
          className="bg-gradient-to-l from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => navigate("/register")}
        >
          הרשמה עכשיו - זה בחינם!
        </button>
      </motion.div>
      
    </div>
  );
}