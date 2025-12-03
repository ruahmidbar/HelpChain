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
  const [formData, setFormData] = useState({ subject: "", date: "", time: "", duration: "60", place: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.date || !formData.time || !formData.place) {
      toast.error("נא למלא הכל");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "meetings"), {
        helper_id: user.uid,
        helper_name: user.displayName,
        requester_id: targetUserId,
        ...formData,
        status: "ממתין לאישור",
        created_at: new Date().toISOString()
      });
      toast.success("בקשה נשלחה!");
      setOpen(false);
    } catch (error) {
      toast.error("שגיאה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <Calendar className="w-4 h-4 ml-2" /> קבע פגישה
        </Button>
      </DialogTrigger>
      <DialogContent open={open} onOpenChange={setOpen}>
        <DialogHeader><DialogTitle>תיאום פגישה עם {targetUserName}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>מקצוע</Label>
            <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="בחר" /></SelectTrigger>
              <SelectContent>
                {(requestData?.subjects?.length > 0 ? requestData.subjects : subjects.map(s => s.name))
                  .map((sub, i) => <SelectItem key={i} value={sub}>{sub}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>תאריך</Label><Input type="date" className="mt-2" onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div><Label>שעה</Label><Input type="time" className="mt-2" onChange={e => setFormData({...formData, time: e.target.value})} /></div>
          </div>
          <div><Label>מקום</Label><Input className="mt-2" onChange={e => setFormData({...formData, place: e.target.value})} /></div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin"/> : "אשר פגישה"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}