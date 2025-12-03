import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function ConfirmMeetingDialog({ targetUserId, targetUserName, requestData, subjects = [] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    time: "",
    duration: "60",
    place: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.date || !formData.time || !formData.place) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "meetings"), {
        helper_id: currentUser.uid,
        helper_name: currentUser.displayName || "משתמש",
        requester_id: targetUserId,
        ...formData,
        status: "ממתין לאישור",
        created_at: new Date().toISOString()
      });

      // יצירת קישור ליומן גוגל
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);
      const formatDateTime = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`פגישת לימוד - ${formData.subject}`)}&dates=${formatDateTime(startDateTime)}/${formatDateTime(endDateTime)}&details=${encodeURIComponent(`פגישת לימוד עם ${currentUser.displayName}`)}&location=${encodeURIComponent(formData.place)}`;

      toast.success("בקשת הפגישה נשלחה בהצלחה!", {
        action: {
          label: "הוסף ליומן",
          onClick: () => window.open(googleCalendarUrl, '_blank')
        }
      });

      setOpen(false);
      setFormData({ subject: "", date: "", time: "", duration: "60", place: "" });

    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("אירעה שגיאה ביצירת הפגישה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <Calendar className="w-4 h-4 ml-2" />
          קבע פגישה
        </Button>
      </DialogTrigger>
      
      <DialogContent open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>תיאום פגישה עם {targetUserName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>מקצוע *</Label>
            <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
              <SelectTrigger className="mt-2 border-gray-300"><SelectValue placeholder="בחר מקצוע" /></SelectTrigger>
              <SelectContent>
                {requestData?.subjects?.length > 0 
                  ? requestData.subjects.map((sub, i) => <SelectItem key={i} value={sub}>{sub}</SelectItem>)
                  : subjects.map((sub, i) => <SelectItem key={i} value={sub.name}>{sub.name}</SelectItem>)
                }
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>תאריך *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="mt-2 border-gray-300"
                required
              />
            </div>
            <div>
              <Label>שעה *</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="mt-2 cursor-pointer border-gray-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>משך (דקות) *</Label>
              <Select value={formData.duration} onValueChange={(val) => setFormData({...formData, duration: val})}>
                <SelectTrigger className="mt-2 border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 דקות</SelectItem>
                  <SelectItem value="45">45 דקות</SelectItem>
                  <SelectItem value="60">60 דקות</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* --- תפריט המיקום המעודכן --- */}
            <div>
              <Label>מקום *</Label>
              <Select value={formData.place} onValueChange={(val) => setFormData({...formData, place: val})}>
                <SelectTrigger className="mt-2 border-gray-300"><SelectValue placeholder="בחר מקום" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="מקוון">מקוון (זום/מיט)</SelectItem>
                  <SelectItem value="בית הספר">בית הספר</SelectItem>
                  <SelectItem value="הבית שלי">הבית שלי</SelectItem>
                  <SelectItem value="בית התלמיד">בית התלמיד</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin"/> : "אשר פגישה"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}