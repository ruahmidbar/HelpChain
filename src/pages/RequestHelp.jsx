import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Label } from "../Components/ui/label";
import Checkbox from "../Components/ui/checkbox";
import { Input } from "../Components/ui/input";
import Textarea from "../Components/ui/textarea";
import { ArrowRight, Calendar, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const DAYS = [
  { id: "sunday", name: "ראשון" },
  { id: "monday", name: "שני" },
  { id: "tuesday", name: "שלישי" },
  { id: "wednesday", name: "רביעי" },
  { id: "thursday", name: "חמישי" },
  { id: "friday", name: "שישי" },
];

export default function RequestHelp() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [studyMaterial, setStudyMaterial] = useState("");
  const [availableHours, setAvailableHours] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const snap = await getDocs(collection(db, "subjects"));
        setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubjectToggle = (subjectName) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectName) 
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleDayToggle = (dayId) => {
    setAvailableHours(prev => {
      if (prev[dayId]) {
        const newHours = { ...prev };
        delete newHours[dayId];
        return newHours;
      } else {
        return { ...prev, [dayId]: { start_time: "16:00", end_time: "18:00" } };
      }
    });
  };

  const handleTimeChange = (dayId, field, value) => {
    setAvailableHours(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const shareWhatsApp = () => {
    const appUrl = window.location.origin;
    const message = `🎓 היי! רציתי לשתף אתכם באפליקציה מדהימה - HelpChain!\n\nכנסו עכשיו: ${appUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) return toast.error("נא לבחור לפחות תחום אחד");
    if (Object.keys(availableHours).length === 0) return toast.error("נא לבחור לפחות יום אחד");

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const hoursArray = Object.entries(availableHours).map(([day, times]) => ({
        day, 
        dayName: DAYS.find(d => d.id === day)?.name, 
        ...times
      }));

      await addDoc(collection(db, "help_requests"), {
        requester_id: user.uid,
        requester_name: user.displayName || "משתמש",
        subjects: selectedSubjects,
        study_material: studyMaterial,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        available_hours: hoursArray,
        status: "פעיל",
        created_at: new Date()
      });

      toast.success("הבקשה נשלחה בהצלחה! 🎉");
      navigate("/calendar");
    } catch (error) {
      toast.error("אירעה שגיאה בשליחה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectsByCategory = subjects.reduce((acc, subject) => {
    const category = subject.category || "כללי";
    if (!acc[category]) acc[category] = [];
    acc[category].push(subject);
    return acc;
  }, {});

  const Required = () => <span className="text-red-500 mr-1">*</span>;

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-4 pt-2">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="bg-white shadow-md">
              <ArrowRight className="w-4 h-4 ml-2" /> חזור לדף הבית
            </Button>
            <Button variant="outline" onClick={shareWhatsApp} className="gap-2">
              <Share2 className="w-4 h-4" /> הזמן חברים
            </Button>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl mt-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
              בקשת עזרה בלימודים
            </CardTitle>
            <p className="text-gray-600 mt-2">בחר את התחומים והימים בהם אתה צריך עזרה</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div>
                <Label className="text-lg font-semibold mb-4 block">במה צריך עזרה? <Required/></Label>
                <div className="space-y-6">
                  {Object.keys(subjectsByCategory).length === 0 && <p className="text-gray-500">אין מקצועות במערכת</p>}
                  
                  {Object.entries(subjectsByCategory).map(([category, categorySubjects]) => (
                    <div key={category} className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-bold text-purple-700 mb-3">{category}</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {categorySubjects.map((subject) => (
                          <div 
                            key={subject.id} 
                            className="flex items-center space-x-2 space-x-reverse cursor-pointer p-2 hover:bg-white rounded transition-colors" 
                            onClick={() => handleSubjectToggle(subject.name)}
                          >
                            <Checkbox
                              id={subject.id}
                              checked={selectedSubjects.includes(subject.name)}
                              onCheckedChange={() => handleSubjectToggle(subject.name)}
                            />
                            <label htmlFor={subject.id} className="cursor-pointer text-sm font-medium mr-2">
                              {subject.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* פרטים נוספים (עם מסגרת) */}
              <div>
                <Label className="text-lg font-semibold mb-1 block">
                  פרטי חומר הלימוד (אופציונלי)
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  ציין את שם הספר, העמודים או כל פרט רלוונטי אחר
                </p>
                <Textarea
                  value={studyMaterial}
                  onChange={(e) => setStudyMaterial(e.target.value)}
                  placeholder="לדוגמא ספר מתמטיקה כיתה ח' - עמודים 45-52 נושא משוואות ריבועיות"
                  className="min-h-[80px] w-full border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>

              <div>
                <Label className="text-lg font-semibold mb-4 block">מתי נוח לך? <Required/></Label>
                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div key={day.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${availableHours[day.id] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleDayToggle(day.id)}>
                        <Checkbox
                          id={day.id}
                          checked={!!availableHours[day.id]}
                          onCheckedChange={() => handleDayToggle(day.id)}
                        />
                        <span className="w-16 font-medium select-none">{day.name}</span>
                      </div>
                      
                      {availableHours[day.id] && (
                        <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-right-5 duration-300">
                          <Input
                            type="time"
                            className="w-32 cursor-pointer bg-white border-gray-300"
                            value={availableHours[day.id].start_time}
                            onChange={(e) => handleTimeChange(day.id, "start_time", e.target.value)}
                            onClick={(e) => e.target.showPicker?.()}
                          />
                          <span className="text-gray-500">-</span>
                          <Input
                            type="time"
                            className="w-32 cursor-pointer bg-white border-gray-300"
                            value={availableHours[day.id].end_time}
                            onChange={(e) => handleTimeChange(day.id, "end_time", e.target.value)}
                            onClick={(e) => e.target.showPicker?.()}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full py-6 bg-gradient-to-l from-blue-600 to-purple-600" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "שלח בקשה"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}