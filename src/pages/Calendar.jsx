import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";

// --- התיקון: הסרת הסוגריים המסולסלים ---
import Button from "../Components/ui/button";
import Badge from "../Components/ui/badge";

import { Card, CardContent } from "../Components/ui/card";
import { ArrowRight, Calendar as CalendarIcon, HelpCircle, HandHeart, Trash2, Clock, MapPin, BookOpen } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Calendar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState([]);
  const [myOffers, setMyOffers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // שליפת בקשות
        const reqQuery = query(collection(db, "help_requests"), where("requester_id", "==", user.uid));
        const reqSnap = await getDocs(reqQuery);
        setMyRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // שליפת הצעות
        const offQuery = query(collection(db, "help_offers"), where("helper_id", "==", user.uid));
        const offSnap = await getDocs(offQuery);
        setMyOffers(offSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (collectionName, id) => {
    if(!window.confirm("האם למחוק את הפריט?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success("נמחק בהצלחה");
      if (collectionName === "help_requests") {
        setMyRequests(prev => prev.filter(item => item.id !== id));
      } else {
        setMyOffers(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      toast.error("שגיאה במחיקה");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-6">
             <h1 className="text-3xl font-bold">היומן שלי</h1>
             <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowRight className="ml-2 h-4 w-4"/> חזרה
             </Button>
        </div>

        <div className="flex gap-2 mb-6">
            <Button variant={activeTab === "requests" ? "default" : "outline"} onClick={() => setActiveTab("requests")}>
                <HelpCircle className="ml-2 h-4 w-4"/> בקשות שלי
            </Button>
            <Button variant={activeTab === "offers" ? "default" : "outline"} onClick={() => setActiveTab("offers")}>
                <HandHeart className="ml-2 h-4 w-4"/> הצעות שלי
            </Button>
        </div>

        {/* --- כרטיסיות בקשות --- */}
        {activeTab === "requests" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myRequests.length === 0 ? <p className="col-span-full text-gray-500">אין בקשות פעילות</p> : myRequests.map(req => (
                    <Card key={req.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-0">בקשה</Badge>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete("help_requests", req.id)}><Trash2 className="text-red-500 h-4 w-4"/></Button>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">מקצועות:</p>
                                <div className="flex flex-wrap gap-1">
                                    {req.subjects?.map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}
                                </div>
                            </div>

                            {req.study_material && (
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                    <p className="font-bold flex items-center gap-1 text-xs text-gray-500"><BookOpen className="w-3 h-3"/> חומר לימוד:</p>
                                    <p>{req.study_material}</p>
                                </div>
                            )}

                            {req.available_hours && (
                                <div className="text-xs text-gray-600">
                                    <p className="font-bold mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> זמינות:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {req.available_hours.map((h, i) => (
                                            <span key={i} className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-100">
                                                {h.dayName}: {h.start_time}-{h.end_time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        {/* --- כרטיסיות הצעות --- */}
        {activeTab === "offers" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myOffers.length === 0 ? <p className="col-span-full text-gray-500">אין הצעות פעילות</p> : myOffers.map(offer => (
                    <Card key={offer.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">הצעה</Badge>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete("help_offers", offer.id)}><Trash2 className="text-red-500 h-4 w-4"/></Button>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 font-bold mb-1">תחומים:</p>
                                <div className="flex flex-wrap gap-1">
                                    {offer.subjects?.map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}
                                </div>
                            </div>

                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="w-3 h-3"/> {offer.lesson_duration} דק'
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <MapPin className="w-3 h-3"/> {offer.meeting_place}
                                </div>
                            </div>

                            {offer.study_material && (
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                    <p className="font-bold flex items-center gap-1 text-xs text-gray-500"><BookOpen className="w-3 h-3"/> פירוט:</p>
                                    <p>{offer.study_material}</p>
                                </div>
                            )}

                            {offer.available_hours && (
                                <div className="text-xs text-gray-600">
                                    <p className="font-bold mb-1">זמינות:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {offer.available_hours.map((h, i) => (
                                            <span key={i} className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 border border-purple-100">
                                                {h.dayName}: {h.start_time}-{h.end_time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}