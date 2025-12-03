import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, reload, sendEmailVerification, signOut } from "firebase/auth";
import { firebaseApp } from "../firebase/firebase";
import Button from "../Components/ui/button"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Mail, Loader2, LogOut, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 דקות בשניות

  useEffect(() => {
    // 1. האזנה למצב המשתמש
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      } else {
        setCurrentUser(user);
        if (user.emailVerified) {
          navigate("/dashboard");
        }
      }
    });

    // 2. טיימר לספירה לאחור + בדיקה אוטומטית
    const timerId = setInterval(async () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId); // עצור כשהזמן נגמר
          return 0;
        }
        return prev - 1;
      });

      // בדיקה מול פיירבייס (רק אם נשאר זמן)
      if (timeLeft > 0) {
        const user = auth.currentUser;
        if (user) {
          try {
            await reload(user);
            if (user.emailVerified) {
              toast.success("החשבון אומת בהצלחה! מעביר לדשבורד...");
              navigate("/dashboard");
            }
          } catch (error) {
            console.error("Error checking verification:", error);
          }
        }
      }
    }, 1000); // רוץ כל שנייה

    return () => {
      unsubscribeAuth();
      clearInterval(timerId);
    };
  }, [navigate, timeLeft]);

  // המרת שניות לפורמט דקות:שניות
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResendEmail = async () => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
        setIsResending(true);
        try {
            await sendEmailVerification(user); 
            toast.success("מייל אימות נשלח שוב בהצלחה.");
            setTimeLeft(300); // איפוס הטיימר ל-5 דקות
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/too-many-requests') {
                toast.error("נשלחו יותר מדי בקשות. נסה שוב בעוד דקה.");
            } else {
                toast.error("שגיאה בשליחה. נסה שוב מאוחר יותר.");
            }
        } finally {
            setIsResending(false);
        }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md text-center shadow-lg border-t-4 border-blue-600">
        <CardHeader>
          <div className="mx-auto bg-blue-50 p-4 rounded-full w-fit mb-4 animate-pulse">
            <Mail className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">אימות כתובת מייל</CardTitle>
          <CardDescription className="text-lg mt-2">
            שלחנו קישור לאימות לכתובת: <br/>
            <span className="font-bold text-gray-900 bg-yellow-50 px-2 py-1 rounded mt-1 inline-block">
              {currentUser?.email}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* אזור הטיימר והסטטוס */}
          <div className="flex flex-col items-center justify-center space-y-2 text-gray-600">
            {timeLeft > 0 ? (
              <>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                  <Clock className="w-5 h-5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   ממתין לאימות... הדף יתעדכן אוטומטית
                </div>
              </>
            ) : (
              <p className="text-red-500 font-bold">הזמן עבר. נסה לשלוח מייל שוב.</p>
            )}
          </div>

          {/* הודעת ספאם - חשוב! */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-start gap-2 text-right">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">לא קיבלת את המייל?</span>
              <br/>
              מומלץ לבדוק בתיקיית <strong>"דואר זבל" (Spam)</strong> או "קידומי מכירות".
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <Button 
              variant="outline" 
              onClick={handleResendEmail}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              disabled={isResending}
            >
              {isResending ? "שולח..." : "שלח מייל אימות חדש"}
            </Button>

            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center w-full text-sm text-gray-400 hover:text-red-500 transition-colors gap-1 py-2"
            >
              <LogOut className="w-3 h-3" />
              טעות במייל? התנתק והירשם מחדש
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}