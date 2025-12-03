import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";
import { Button } from "./ui/button"; 
import Textarea from "./ui/textarea"; 
import { Label } from "./ui/label"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"; 
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function MessageDialog({ targetUserId, targetUserName }) {
  const [open, setOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        from_user_id: currentUser.uid,
        from_user_name: currentUser.displayName || "משתמש",
        to_user_id: targetUserId,
        content: messageText,
        type: "הודעה רגילה",
        is_read: false,
        created_at: new Date().toISOString()
      });
      toast.success("ההודעה נשלחה!");
      setOpen(false);
      setMessageText("");
    } catch (error) {
      toast.error("שגיאה בשליחה");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageCircle className="w-4 h-4 ml-2" /> שלח הודעה
        </Button>
      </DialogTrigger>
      <DialogContent open={open} onOpenChange={setOpen}>
        <DialogHeader><DialogTitle>הודעה ל-{targetUserName}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block font-medium">תוכן ההודעה</Label>
            {/* כאן הוספתי את העיצוב למסגרת וגובה */}
            <Textarea 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)} 
                className="min-h-[150px] w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-base" 
                placeholder="היי, ראיתי שאת/ה יכול/ה לעזור ב..."
            />
          </div>
          <Button type="submit" className="w-full py-6" disabled={isSending}>
            {isSending ? <Loader2 className="animate-spin"/> : "שלח הודעה"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}