import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseApp } from "../firebase/firebase"; 
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// רכיבי UI
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";

// ייבוא ספריית ההתראות
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // אם המשתמש מחובר, נבדוק אם המייל מאומת
        if (user.emailVerified) {
             const userDocRef = doc(db, "users", user.uid);
             const userSnap = await getDoc(userDocRef);
             if (userSnap.exists()) {
                navigate("/dashboard");
             }
        } else {
            // אם המשתמש מחובר אבל לא מאומת - נשלח אותו לאימות
            navigate("/verify-email");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("נא למלא אימייל וסיסמה");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // בדיקה קריטית: האם המייל אומת?
      if (!user.emailVerified) {
          toast.warning("עליך לאמת את כתובת המייל לפני הכניסה לדאשבורד.");
          navigate("/verify-email");
          return;
      }

      toast.success("התחברת בהצלחה!");
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error code:", error.code);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          toast.error("פרטי ההתחברות שגויים. נסה שנית.");
      } else if (error.code === 'auth/wrong-password') {
          toast.error("הסיסמה שהזנת שגויה.");
      } else if (error.code === 'auth/too-many-requests') {
          toast.error("יותר מדי ניסיונות כושלים. נסה שוב מאוחר יותר.");
      } else {
          toast.error("אירעה שגיאה בכניסה: " + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">כניסה ל-HelpChain</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="הכנס אימייל"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="הכנס סיסמה"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg mt-4">
            התחבר
          </Button>
          
           <div className="text-center mt-4">
            <span className="text-sm text-gray-600">עדיין לא נרשמת? </span>
            <button 
                type="button"
                onClick={() => navigate("/register")} 
                className="text-sm text-blue-600 font-semibold hover:underline"
            >
                לחץ כאן להרשמה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}