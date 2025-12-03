import React, { useState, useEffect } from "react";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  updateDoc 
} from "firebase/firestore";
import { firebaseApp } from "../../firebase/firebase";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Trash2, Plus, School, BookOpen, Users, FileText, HandHeart, RefreshCw, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";

const db = getFirestore(firebaseApp);

export default function AdminContent() {
  const [loading, setLoading] = useState(true);
  
  // נתונים
  const [schools, setSchools] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);

  // טפסים להוספה
  const [newSchool, setNewSchool] = useState({ name: "", city: "" });
  const [newGrade, setNewGrade] = useState({ name: "", school_id: "" });
  const [newSubject, setNewSubject] = useState({ name: "", category: "" });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const schoolsSnap = await getDocs(query(collection(db, "schools"), orderBy("city")));
      setSchools(schoolsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const gradesSnap = await getDocs(collection(db, "grades"));
      setGrades(gradesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const subjectsSnap = await getDocs(collection(db, "subjects"));
      setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const reqSnap = await getDocs(collection(db, "help_requests"));
      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const offSnap = await getDocs(collection(db, "help_offers"));
      setOffers(offSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (error) {
      console.error("Error fetching admin content:", error);
      toast.error("שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("הקוד הועתק!");
  };

  const handleRegenerateCode = async (schoolId) => {
    const newCode = generateCode();
    try {
        await updateDoc(doc(db, "schools", schoolId), { staffCode: newCode });
        setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, staffCode: newCode } : s));
        toast.success("קוד חדש נוצר בהצלחה");
    } catch (error) {
        toast.error("שגיאה ביצירת קוד");
    }
  };

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.city) return;
    try {
      const staffCode = generateCode();
      const docData = { ...newSchool, staffCode };
      
      const docRef = await addDoc(collection(db, "schools"), docData);
      setSchools([...schools, { id: docRef.id, ...docData }]);
      setNewSchool({ name: "", city: "" });
      toast.success(`בית ספר נוסף! קוד צוות: ${staffCode}`);
    } catch (e) { toast.error("שגיאה"); }
  };

  const handleAddGrade = async () => {
    if (!newGrade.name || !newGrade.school_id) return;
    try {
      const docRef = await addDoc(collection(db, "grades"), newGrade);
      setGrades([...grades, { id: docRef.id, ...newGrade }]);
      setNewGrade({ name: "", school_id: "" });
      toast.success("כיתה נוספה");
    } catch (e) { toast.error("שגיאה"); }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name) return;
    try {
      const docRef = await addDoc(collection(db, "subjects"), newSubject);
      setSubjects([...subjects, { id: docRef.id, ...newSubject }]);
      setNewSubject({ name: "", category: "" });
      toast.success("מקצוע נוסף");
    } catch (e) { toast.error("שגיאה"); }
  };

  const handleDelete = async (collectionName, id, setStateFunc) => {
    if (!window.confirm("האם למחוק פריט זה?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      setStateFunc(prev => prev.filter(item => item.id !== id));
      toast.success("נמחק בהצלחה");
    } catch (e) { toast.error("שגיאה במחיקה"); }
  };

  if (loading) return <div className="p-10 text-center">טוען נתונים...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <School className="text-purple-600" />
        ניהול תוכן המערכת
      </h1>

      <Tabs defaultValue="schools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-xl shadow border">
          <TabsTrigger value="schools"><School className="w-4 h-4 ml-2"/> בתי ספר</TabsTrigger>
          <TabsTrigger value="grades"><Users className="w-4 h-4 ml-2"/> כיתות</TabsTrigger>
          <TabsTrigger value="subjects"><BookOpen className="w-4 h-4 ml-2"/> מקצועות</TabsTrigger>
          <TabsTrigger value="requests"><FileText className="w-4 h-4 ml-2"/> בקשות</TabsTrigger>
          <TabsTrigger value="offers"><HandHeart className="w-4 h-4 ml-2"/> הצעות</TabsTrigger>
        </TabsList>

        <TabsContent value="schools">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>הוספת מוסד</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="עיר" value={newSchool.city} onChange={e => setNewSchool({...newSchool, city: e.target.value})} />
                <Input placeholder="שם המוסד" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} />
                <Button onClick={handleAddSchool} className="w-full"><Plus className="w-4 h-4 ml-2"/> הוסף (ייוצר קוד אוטומטי)</Button>
              </CardContent>
            </Card>
            
            <div className="md:col-span-2 bg-white rounded-xl border p-4 max-h-[500px] overflow-y-auto">
              <h3 className="font-bold mb-4">רשימת בתי ספר ({schools.length})</h3>
              <div className="divide-y">
                {schools.map(s => (
                  <div key={s.id} className="flex justify-between items-start p-4 hover:bg-gray-50 border-b last:border-0">
                    <div>
                        <div className="font-bold text-lg mb-1">{s.city} - {s.name}</div>
                        
                        {/* --- תיקון עיצוב הקוד: גדול וברור יותר --- */}
                        <div className="flex items-center gap-3 mt-2 bg-gray-100 px-3 py-2 rounded-lg w-fit border border-gray-200 shadow-sm">
                            <KeyRound className="w-5 h-5 text-gray-600" />
                            <span className="text-base font-mono font-bold text-gray-800 tracking-wider">
                                {s.staffCode || "אין קוד"}
                            </span>
                            <div className="w-px h-5 bg-gray-300 mx-1"></div> {/* קו מפריד */}
                            <button 
                                onClick={() => copyToClipboard(s.staffCode)} 
                                title="העתק קוד"
                                className="p-1 hover:bg-white rounded transition-colors text-blue-600"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleRegenerateCode(s.id)} 
                                title="החלף קוד"
                                className="p-1 hover:bg-white rounded transition-colors text-orange-600"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("schools", s.id, setSchools)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-5 h-5"/>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* שאר הטאבים נשארים ללא שינוי מהגרסה הקודמת */}
        <TabsContent value="grades">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>הוספת כיתה</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="שם הכיתה (למשל י'2)" value={newGrade.name} onChange={e => setNewGrade({...newGrade, name: e.target.value})} />
                <Select value={newGrade.school_id} onValueChange={val => setNewGrade({...newGrade, school_id: val})}>
                  <SelectTrigger><SelectValue placeholder="שייך לבית ספר" /></SelectTrigger>
                  <SelectContent>
                    {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.city})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddGrade} className="w-full"><Plus className="w-4 h-4 ml-2"/> הוסף</Button>
              </CardContent>
            </Card>
            <div className="md:col-span-2 bg-white rounded-xl border p-4 max-h-[500px] overflow-y-auto">
              <h3 className="font-bold mb-4">רשימת כיתות ({grades.length})</h3>
              <div className="divide-y">
                {grades.map(g => (
                  <div key={g.id} className="flex justify-between p-3 hover:bg-gray-50">
                    <div>
                      <span className="font-bold">{g.name}</span>
                      <span className="text-sm text-gray-500 mr-2">
                        ({schools.find(s => s.id === g.school_id)?.name || "לא משויך"})
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("grades", g.id, setGrades)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>הוספת מקצוע</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="שם המקצוע" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} />
                <Select value={newSubject.category} onValueChange={val => setNewSubject({...newSubject, category: val})}>
                  <SelectTrigger><SelectValue placeholder="קטגוריה" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="מדעים">מדעים</SelectItem>
                    <SelectItem value="שפות">שפות</SelectItem>
                    <SelectItem value="הומני">הומני</SelectItem>
                    <SelectItem value="אחר">אחר</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddSubject} className="w-full"><Plus className="w-4 h-4 ml-2"/> הוסף</Button>
              </CardContent>
            </Card>
            <div className="md:col-span-2 bg-white rounded-xl border p-4 max-h-[500px] overflow-y-auto">
              <h3 className="font-bold mb-4">רשימת מקצועות ({subjects.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>{s.name} <span className="text-xs text-gray-400">({s.category})</span></span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete("subjects", s.id, setSubjects)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-bold mb-4">ניהול בקשות עזרה ({requests.length})</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {requests.map(req => (
                <div key={req.id} className="border p-3 rounded-lg flex justify-between items-start">
                  <div>
                    <div className="font-bold text-blue-600">{req.requester_name}</div>
                    <div className="text-sm">נושאים: {req.subjects?.join(", ")}</div>
                    <div className="text-xs text-gray-400">{req.status}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete("help_requests", req.id, setRequests)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="offers">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-bold mb-4">ניהול הצעות עזרה ({offers.length})</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {offers.map(off => (
                <div key={off.id} className="border p-3 rounded-lg flex justify-between items-start">
                  <div>
                    <div className="font-bold text-green-600">{off.helper_name}</div>
                    <div className="text-sm">נושאים: {off.subjects?.join(", ")}</div>
                    <div className="text-xs text-gray-400">{off.status}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete("help_offers", off.id, setOffers)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}