import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";

// --- התיקונים כאן: הורדתי את הסוגריים המסולסלים מ-Button ומ-Badge ---
import Button from "../Components/ui/button";
import Badge from "../Components/ui/badge";

import { Card, CardContent } from "../Components/ui/card";
import { ArrowRight, Calendar as CalendarIcon, HelpCircle, HandHeart, Trash2 } from "lucide-react";
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
        const reqQuery = query(collection(db, "help_requests"), where("requester_id", "==", user.uid));
        const reqSnap = await getDocs(reqQuery);
        setMyRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));

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
    if(!window.confirm("האם למחוק?")) return;
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

        {activeTab === "requests" && (
            <div className="space-y-4">
                {myRequests.length === 0 ? <p>אין בקשות פעילות</p> : myRequests.map(req => (
                    <Card key={req.id}><CardContent className="p-4 flex justify-between">
                        <div>
                            <Badge>בקשה</Badge>
                            <p className="mt-2 font-bold">{req.subjects?.join(", ")}</p>
                        </div>
                        <Button variant="ghost" onClick={() => handleDelete("help_requests", req.id)}><Trash2 className="text-red-500 h-4 w-4"/></Button>
                    </CardContent></Card>
                ))}
            </div>
        )}

        {activeTab === "offers" && (
            <div className="space-y-4">
                {myOffers.length === 0 ? <p>אין הצעות פעילות</p> : myOffers.map(offer => (
                    <Card key={offer.id}><CardContent className="p-4 flex justify-between">
                        <div>
                            <Badge className="bg-purple-100 text-purple-700">הצעה</Badge>
                            <p className="mt-2 font-bold">{offer.subjects?.join(", ")}</p>
                        </div>
                        <Button variant="ghost" onClick={() => handleDelete("help_offers", offer.id)}><Trash2 className="text-red-500 h-4 w-4"/></Button>
                    </CardContent></Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}