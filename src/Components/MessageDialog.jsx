import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase/firebase";
import { Button } from "./ui/button"; 
import Textarea from "./ui/textarea"; // <-- תיקון: בלי סוגריים!
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
            <Label>הודעה</Label>
            <Textarea 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)} 
                className="mt-2" 
                placeholder="כתוב כאן..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? <Loader2 className="animate-spin"/> : "שלח"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}