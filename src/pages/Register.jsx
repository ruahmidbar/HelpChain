import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { firebaseApp } from "../firebase/firebase";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification,
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";
import { Button } from "../Components/ui/button"; 
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Loader2, KeyRound, GraduationCap, School } from "lucide-react";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const MOCK_GRADES = [
  "כיתה ז'", "כיתה ח'", "כיתה ט'", "כיתה י'", "כיתה יא'", "כיתה יב'"
];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolsList, setSchoolsList] = useState([]);
  
  // משתנה שמנהל האם להציג את שדה הקוד
  const [isStaffRegistration, setIsStaffRegistration] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationCode, setRegistrationCode] = useState(""); 

  const [formData, setFormData] = useState({
    first_name: "", 
    last_name: "", 
    city: "",
    school: "", 
    grade: "",  
    phone: "",
    parent_type: "", 
    parent_name: "", 
    parent_email: ""
  });

  useEffect(() => {
    const init = async () => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser?.emailVerified) {
             navigate("/dashboard");
        }
      });

      try {
        const querySnapshot = await getDocs(collection(db, "schools"));
        const list = querySnapshot.docs.map(doc => doc.data());
        setSchoolsList(list);
      } catch (error) {
        console.error("Error loading schools:", error);
      } finally {
        setLoading(false);
      }

      return () => unsubscribe();
    };

    init();
  }, [navigate]);

  const citiesList = [...new Set(schoolsList.map(s => s.city))];
  const filteredSchools = schoolsList.filter(s => s.city === formData.city);

  const toggleStaffMode = () => {
    setIsStaffRegistration(!isStaffRegistration);
    setRegistrationCode(""); // איפוס הקוד כשסוגרים/פותחים
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || password.length < 6) {
        toast.error("נא להזין אימייל וסיסמה תקינים (לפחות 6 תווים)");
        return;
    }

    const requiredFields = ["first_name", "last_name", "city", "school", "grade"];
    for (let f of requiredFields) {
        if (!formData[f]) {
            toast.error("נא למלא את כל שדות החובה המסומנים בכוכבית");
            return;
        }
    }

    setIsSubmitting(true);

    try {
      let assignedRole = "student"; 
      
      // בדיקת קוד רק אם המצב "הרשמת צוות" פעיל
      if (isStaffRegistration && registrationCode) {
        const selectedSchoolData = schoolsList.find(s => s.name === formData.school && s.city === formData.city);
        
        if (selectedSchoolData && selectedSchoolData.staffCode === registrationCode) {
            assignedRole = "staff"; // הופך לצוות
            toast.info("קוד צוות אומת בהצלחה! ברוך הבא לצוות בית הספר.");
        } else {
            toast.warning("קוד שגוי לבית הספר שנבחר. נרשם כתלמיד.");
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: `${formData.first_name} ${formData.last_name}` });
      
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        email: email,
        role: assignedRole, 
        createdAt: new Date()
      });

      await sendEmailVerification(user);
      
      toast.success("ההרשמה בוצעה בהצלחה! נשלח אליך מייל לאימות.");
      navigate("/verify-email");

    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error("כתובת האימייל הזו כבר רשומה במערכת.");
      } else {
        toast.error("שגיאה בהרשמה: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const Required = () => <span className="text-red-500 mr-1">*</span>;

  if (loading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100" dir="rtl">
      <Card className="w-full max-w-lg shadow-xl my-8">
        <CardHeader>
          <div className="flex justify-between items-start">
             <div>
                <CardTitle className="text-2xl">הרשמה ל-HelpChain</CardTitle>
                <CardDescription>מלא את הפרטים וקבל קישור לאימות במייל</CardDescription>
             </div>
             
             {/* --- כפתור טוגל לצוות --- */}
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleStaffMode}
                className={`text-xs ${isStaffRegistration ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}
             >
                {isStaffRegistration ? <School className="w-4 h-4 ml-1"/> : <GraduationCap className="w-4 h-4 ml-1"/>}
                {isStaffRegistration ? "חזרה להרשמת תלמיד" : "הרשמה לצוות הוראה"}
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="bg-blue-50 p-4 rounded-lg space-y-3 mb-4 border border-blue-100">
                <h3 className="font-bold text-blue-800 text-sm">פרטי התחברות</h3>
                <div className="space-y-2">
                    <Label>אימייל <Required /></Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your-email@example.com" />
                </div>
                <div className="space-y-2">
                    <Label>סיסמה <Required /></Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="********" />
                </div>
            </div>

            {/* --- אזור הקוד הסודי (מופיע רק כשלוחצים על הכפתור למעלה) --- */}
            {isStaffRegistration && (
                <div className="bg-purple-50 p-4 rounded-lg space-y-2 border border-purple-100 mb-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                        <KeyRound className="w-4 h-4"/>
                        <span>קוד אימות לצוות</span>
                    </div>
                    <Input 
                        value={registrationCode} 
                        onChange={e => setRegistrationCode(e.target.value)} 
                        placeholder="הזן את הקוד שקיבלת מהמנהל..." 
                        className="bg-white"
                        autoFocus
                    />
                    <p className="text-xs text-gray-500">הקוד ייבדק מול בית הספר שנבחר למטה.</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם פרטי <Required /></Label>
                <Input value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>שם משפחה <Required /></Label>
                <Input value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>עיר מגורים <Required /></Label>
              <Input 
                list="cities-list" 
                placeholder="בחר מרשימה או הקלד..." 
                value={formData.city} 
                onChange={e => setFormData({ ...formData, city: e.target.value })} 
                required 
              />
              <datalist id="cities-list">
                {citiesList.map((city, idx) => (
                  <option key={idx} value={city} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>בית ספר <Required /></Label>
                <Input 
                  list="schools-list" 
                  placeholder="בחר או הקלד..."
                  value={formData.school} 
                  onChange={e => setFormData({ ...formData, school: e.target.value })} 
                  required 
                />
                <datalist id="schools-list">
                  {filteredSchools.map((school, idx) => (
                    <option key={idx} value={school.name} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>כיתה <Required /></Label>
                <Input 
                  list="grades-list"
                  placeholder="בחר או הקלד..."
                  value={formData.grade} 
                  onChange={e => setFormData({ ...formData, grade: e.target.value })} 
                  required 
                />
                <datalist id="grades-list">
                  {MOCK_GRADES.map((grade, idx) => (
                    <option key={idx} value={grade} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>טלפון</Label>
              <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <hr className="my-4 border-gray-200" />
            
            <div className="space-y-2">
              <Label>פרטי הורה <Required /></Label>
              <Select onValueChange={(value) => setFormData({ ...formData, parent_type: value })} defaultValue={formData.parent_type}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר הורה (אבא/אמא)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="father">אבא</SelectItem>
                  <SelectItem value="mother">אמא</SelectItem>
                  <SelectItem value="other">אפוטרופוס אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>שם מלא של ההורה <Required /></Label>
              <Input value={formData.parent_name} onChange={e => setFormData({ ...formData, parent_name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>אימייל ההורה <Required /></Label>
              <Input type="email" value={formData.parent_email} onChange={e => setFormData({ ...formData, parent_email: e.target.value })} required />
            </div>

            <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "הירשם למערכת"}
            </Button>

            <div className="text-center mt-2 text-sm">
                כבר רשום? <span className="text-blue-600 cursor-pointer font-bold" onClick={() => navigate("/login")}>התחבר כאן</span>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}