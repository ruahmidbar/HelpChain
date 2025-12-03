import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";
import { Button } from "../Components/ui/button"; 
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import Badge from "../Components/ui/badge"; // <-- תיקון: בלי סוגריים
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";

// תיקון נתיבים לדיאלוגים (C גדולה)
import MessageDialog from "../Components/MessageDialog"; 
import ConfirmMeetingDialog from "../Components/ConfirmMeetingDialog";

const db = getFirestore(firebaseApp);

export default function BrowseRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqSnap = await getDocs(query(collection(db, "help_requests"), where("status", "==", "פעיל")));
        setRequests(reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const subSnap = await getDocs(collection(db, "subjects"));
        setSubjects(subSnap.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const requesterName = req.requester_name || "תלמיד";
    const matchesSearch = searchTerm === "" || requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || req.subjects?.includes(filterSubject);
    return matchesSearch && matchesSubject;
  });

  if (loading) return <div className="p-10 text-center">טוען בקשות...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowRight className="w-4 h-4 ml-2" /> חזור
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-l from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            תלמידים שמבקשים עזרה
          </h1>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>חיפוש לפי שם</Label>
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <Label>סנן לפי מקצוע</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger><SelectValue placeholder="הכל" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    {subjects.map((sub, i) => <SelectItem key={i} value={sub.name}>{sub.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredRequests.length === 0 ? (
          <Card className="text-center p-12"><p className="text-gray-500">אין בקשות עזרה</p></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => (
              <Card key={req.id} className="bg-white/90 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-600"/>
                        <span>{req.requester_name || "תלמיד"}</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 border-0">מבקש עזרה</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 font-bold">נושאים:</p>
                    <div className="flex flex-wrap gap-2">
                      {req.subjects?.map((sub, i) => <Badge key={i} variant="outline">{sub}</Badge>)}
                    </div>
                  </div>
                  
                  {req.available_hours && (
                      <div className="text-sm bg-gray-50 p-3 rounded-lg">
                          <p className="font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> זמינות:</p>
                          <div className="flex flex-wrap gap-2">
                            {req.available_hours.map((h, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                    {h.dayName || h.day}: {h.start_time}-{h.end_time}
                                </Badge>
                            ))}
                          </div>
                      </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <MessageDialog targetUserId={req.requester_id} targetUserName={req.requester_name} />
                    <ConfirmMeetingDialog
                      targetUserId={req.requester_id}
                      targetUserName={req.requester_name}
                      requestData={req}
                      subjects={subjects}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}