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
import { ArrowRight, Clock, MapPin, User, MessageCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

// תיקון נתיבים לדיאלוגים (C גדולה)
import MessageDialog from "../Components/MessageDialog"; 
import ConfirmMeetingDialog from "../Components/ConfirmMeetingDialog";

const db = getFirestore(firebaseApp);

export default function BrowseOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offSnap = await getDocs(query(collection(db, "help_offers"), where("status", "==", "פעיל")));
        setOffers(offSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const subSnap = await getDocs(collection(db, "subjects"));
        setSubjects(subSnap.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOffers = offers.filter((offer) => {
    const helperName = offer.helper_name || "תלמיד";
    const matchesSearch = searchTerm === "" || helperName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || offer.subjects?.includes(filterSubject);
    return matchesSearch && matchesSubject;
  });

  if (loading) return <div className="p-10 text-center">טוען הצעות...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowRight className="w-4 h-4 ml-2" /> חזור
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-l from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            לוח מציעים עזרה
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

        {filteredOffers.length === 0 ? (
          <Card className="text-center p-12"><p className="text-gray-500">אין הצעות עזרה</p></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className="bg-white/90 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-600"/>
                        <span>{offer.helper_name || "תלמיד"}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0">מציע עזרה</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 font-bold">יכול לעזור ב:</p>
                    <div className="flex flex-wrap gap-2">
                      {offer.subjects?.map((sub, i) => <Badge key={i} variant="outline">{sub}</Badge>)}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4"/> {offer.lesson_duration} דק'</div>
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {offer.meeting_place}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <MessageDialog targetUserId={offer.helper_id} targetUserName={offer.helper_name} />
                    <ConfirmMeetingDialog
                      targetUserId={offer.helper_id}
                      targetUserName={offer.helper_name}
                      requestData={offer}
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