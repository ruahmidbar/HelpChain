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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { ArrowRight, HandHeart, Loader2 } from "lucide-react";
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

export default function OfferHelp() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [studyMaterial, setStudyMaterial] = useState("");
  const [availableHours, setAvailableHours] = useState({});
  const [lessonDuration, setLessonDuration] = useState("45");
  const [meetingPlace, setMeetingPlace] = useState("");
  const [customPlace, setCustomPlace] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length === 0 || Object.keys(availableHours).length === 0 || !meetingPlace) {
      toast.error("נא למלא את כל שדות החובה: תחום, יום ומקום מפגש");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      const hoursArray = Object.entries(availableHours).map(([day, times]) => ({
        day,
        dayName: DAYS.find(d => d.id === day)?.name,
        ...times
      }));

      await addDoc(collection(db, "help_offers"), {
        helper_id: user.uid,
        helper_name: user.displayName || "משתמש",
        subjects: selectedSubjects,
        study_material: studyMaterial,
        available_hours: hoursArray,
        lesson_duration: lessonDuration,
        meeting_place: meetingPlace === "אחר" ? customPlace : meetingPlace,
        status: "פעיל",
        created_at: new Date(),
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });

      toast.success("ההצעה פורסמה בהצלחה! 🎉");
      navigate("/calendar");
    } catch (error) {
      toast.error("אירעה שגיאה בפרסום");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectsByCategory = subjects.reduce((acc, subject) => {
    const category = subject.category || "אחר";
    if (!acc[category]) acc[category] = [];
    acc[category].push(subject);
    return acc;
  }, {});

  const Required = () => <span className="text-red-500 mr-1">*</span>;

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-4 pt-2">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="bg-white shadow-md">
            <ArrowRight className="ml-2 w-4 h-4" /> חזור
          </Button>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl mt-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-l from-purple-600 to-pink-600 bg-clip-text text-transparent">
              הצעת עזרה בלימודים
            </CardTitle>
            <p className="text-gray-600 mt-2">בחר את התחומים והימים בהם אתה יכול לעזור</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* בחירת תחומים */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">במה תרצה לעזור? <Required/></Label>
                <div className="space-y-6">
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

              {/* פרטים נוספים - מעודכן */}
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
                  className="min-h-[80px] w-full border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                />
              </div>

              {/* זמנים - מעודכן עם לחיצה על כל השורה */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">בחר ימים ושעות זמינות <Required/></Label>
                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div key={day.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${availableHours[day.id] ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
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
                            type="time" className="w-32 cursor-pointer bg-white border-gray-300"
                            value={availableHours[day.id].start_time}
                            onChange={(e) => handleTimeChange(day.id, "start_time", e.target.value)}
                            onClick={(e) => e.target.showPicker?.()}
                          />
                          <span className="text-gray-500">-</span>
                          <Input
                            type="time" className="w-32 cursor-pointer bg-white border-gray-300"
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>משך שיעור <Required/></Label>
                  <Select value={lessonDuration} onValueChange={setLessonDuration}>
                    <SelectTrigger className="mt-2 border-gray-300"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 דקות</SelectItem>
                      <SelectItem value="45">45 דקות</SelectItem>
                      <SelectItem value="60">60 דקות</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>מקום מפגש <Required/></Label>
                  <Select value={meetingPlace} onValueChange={setMeetingPlace}>
                    <SelectTrigger className="mt-2 border-gray-300"><SelectValue placeholder="בחר מקום" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="מקוון">מקוון</SelectItem>
                      <SelectItem value="בית הספר">בית הספר</SelectItem>
                      <SelectItem value="אחר">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {meetingPlace === "אחר" && (
                <div>
                  <Label>פרט את המקום</Label>
                  <Input 
                    value={customPlace} 
                    onChange={(e) => setCustomPlace(e.target.value)} 
                    className="mt-2 border-gray-300" 
                    placeholder="הכנס מיקום..."
                  />
                </div>
              )}

              <Button type="submit" className="w-full py-6 bg-gradient-to-l from-purple-600 to-pink-600" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "פרסם הצעה"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}