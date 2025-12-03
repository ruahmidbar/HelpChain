import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  updateDoc, 
  doc,
  getDocs,
  writeBatch 
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../firebase/firebase";
import Button from "../Components/ui/button";
import { Card, CardContent } from "../Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Components/ui/tabs";
import Badge from "../Components/ui/badge";
import Checkbox from "../Components/ui/checkbox";
import { 
  ArrowRight, 
  Mail, 
  Send, 
  Trash2, 
  CheckCircle, 
  MailOpen, 
  Clock,
  Reply,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import MessageDialog from "../Components/MessageDialog"; 

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Notifications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inbox");
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    // שימוש ב-onAuthStateChanged כדי למנוע מצב של "נתקע בטעינה"
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        navigate("/"); // אם אין משתמש, זרוק החוצה
        return;
      }

      try {
        // טעינת שמות משתמשים
        const usersSnap = await getDocs(collection(db, "users"));
        const map = {};
        usersSnap.docs.forEach(doc => {
          const d = doc.data();
          map[doc.id] = `${d.first_name || ""} ${d.last_name || ""}`.trim() || d.email;
        });
        setUsersMap(map);

        // 1. האזנה להודעות נכנסות
        const qInbox = query(
          collection(db, "messages"), 
          where("to_user_id", "==", user.uid)
        );

        const unsubInbox = onSnapshot(qInbox, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          msgs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          setInboxMessages(msgs);
          setLoading(false); // סיום טעינה רק אחרי שקיבלנו נתונים
        }, (error) => {
          console.error("Inbox Error:", error);
          setLoading(false); // סיום טעינה גם בשגיאה
        });

        // 2. האזנה להודעות יוצאות
        const qSent = query(
          collection(db, "messages"), 
          where("from_user_id", "==", user.uid)
        );

        const unsubSent = onSnapshot(qSent, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          msgs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          setSentMessages(msgs);
        });

        // שמירת פונקציות הניקוי
        return () => {
          unsubInbox();
          unsubSent();
        };

      } catch (error) {
        console.error("Error setup:", error);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // --- ניהול בחירה ---
  useEffect(() => { setSelectedIds([]); }, [activeTab]);

  const handleSelectAll = (checked) => {
    const currentList = activeTab === "inbox" ? inboxMessages : sentMessages;
    if (checked) setSelectedIds(currentList.map(m => m.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id, checked) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(item => item !== id));
  };

  // --- פעולות ---
  const performBatchAction = async (actionType) => {
    if (selectedIds.length === 0) return;
    const batch = writeBatch(db);
    let msg = "";

    selectedIds.forEach(id => {
      const docRef = doc(db, "messages", id);
      if (actionType === "delete") {
        batch.delete(docRef);
        msg = "הודעות נמחקו";
      } else if (actionType === "markRead") {
        batch.update(docRef, { is_read: true });
        msg = "סומן כנקרא";
      } else if (actionType === "markUnread") {
        batch.update(docRef, { is_read: false });
        msg = "סומן כלא נקרא";
      }
    });

    try {
      await batch.commit();
      toast.success(msg);
      setSelectedIds([]);
    } catch (error) {
      toast.error("שגיאה בפעולה");
    }
  };

  const handleDelete = async (msgId) => {
    if(!window.confirm("למחוק הודעה זו?")) return;
    try {
      await deleteDoc(doc(db, "messages", msgId));
      toast.success("הודעה נמחקה");
    } catch (error) { toast.error("שגיאה"); }
  };

  const handleMarkAsRead = async (msgId, currentStatus) => {
    try { await updateDoc(doc(db, "messages", msgId), { is_read: !currentStatus }); } catch (error) { console.error(error); }
  };

  const MessageItem = ({ msg, type }) => {
    const isInbox = type === 'inbox';
    const otherUserId = isInbox ? msg.from_user_id : msg.to_user_id;
    const otherUserName = usersMap[otherUserId] || (isInbox ? msg.from_user_name : msg.to_user_name) || "משתמש";
    const isSelected = selectedIds.includes(msg.id);

    return (
      <div className={`
        flex items-center gap-4 p-3 border-b last:border-0 transition-colors cursor-pointer group
        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
        ${!msg.is_read && isInbox ? 'bg-white font-bold' : 'bg-gray-50/50 text-gray-600'}
      `}>
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectOne(msg.id, checked)} />
        </div>

        <div className="text-gray-400">
          {!msg.is_read && isInbox ? <Mail className="w-5 h-5 text-blue-600 fill-blue-100" /> : <MailOpen className="w-5 h-5" />}
        </div>

        <div className="w-32 md:w-40 truncate">{otherUserName}</div>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="truncate">{msg.content}</span>
          {!msg.is_read && isInbox && <Badge className="bg-blue-600 text-[10px] px-1 py-0 h-5">חדש</Badge>}
        </div>

        <div className="flex items-center gap-4 min-w-[120px] justify-end">
          <span className="text-xs group-hover:hidden">
            {msg.created_at ? new Date(msg.created_at).toLocaleDateString('he-IL') : ''}
          </span>
          
          <div className="hidden group-hover:flex items-center gap-1">
             {isInbox && (
               <div onClick={(e) => e.stopPropagation()}>
                 <MessageDialog 
                    targetUserId={otherUserId} 
                    targetUserName={otherUserName} 
                    label={<Reply className="w-4 h-4"/>} 
                    variant="ghost"
                 />
               </div>
             )}
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(msg.id)}>
                <Trash2 className="w-4 h-4 text-red-500"/>
             </Button>
          </div>
        </div>
      </div>
    );
  };

  const currentList = activeTab === "inbox" ? inboxMessages : sentMessages;
  const isAllSelected = currentList.length > 0 && selectedIds.length === currentList.length;

  if (loading) return <div className="p-10 text-center">טוען הודעות...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">תיבת דואר</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowRight className="w-4 h-4 ml-2" /> חזור לדשבורד
          </Button>
        </div>

        <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white border rounded-t-xl p-2 flex justify-between items-center shadow-sm sticky top-4 z-10">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 border-l pl-4">
                 <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                 <span className="text-sm text-gray-500 hidden md:inline">בחר הכל</span>
               </div>
               {selectedIds.length > 0 ? (
                 <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                    <Button variant="ghost" size="sm" onClick={() => performBatchAction("delete")} title="מחק">
                        <Trash2 className="w-4 h-4 text-red-600"/> <span className="mr-2 hidden md:inline">({selectedIds.length})</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => performBatchAction("markRead")} title="סמן כנקרא"><MailOpen className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => performBatchAction("markUnread")} title="סמן כלא נקרא"><Mail className="w-4 h-4"/></Button>
                 </div>
               ) : (
                 <Button variant="ghost" size="sm" onClick={() => window.location.reload()} title="רענן"><RefreshCw className="w-4 h-4"/></Button>
               )}
            </div>

            <TabsList className="bg-gray-100">
                <TabsTrigger value="inbox" className="gap-2">
                    <Mail className="w-4 h-4"/> נכנס
                    {inboxMessages.filter(m => !m.is_read).length > 0 && (
                        <Badge className="bg-blue-600 h-5 px-1.5 text-[10px]">{inboxMessages.filter(m => !m.is_read).length}</Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="gap-2"><Send className="w-4 h-4"/> יוצא</TabsTrigger>
            </TabsList>
          </div>

          <Card className="rounded-t-none border-t-0 min-h-[500px]">
            <CardContent className="p-0">
                <TabsContent value="inbox" className="m-0">
                    {inboxMessages.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <Mail className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                            <p>אין הודעות נכנסות</p>
                        </div>
                    ) : inboxMessages.map(msg => <MessageItem key={msg.id} msg={msg} type="inbox" />)}
                </TabsContent>

                <TabsContent value="sent" className="m-0">
                    {sentMessages.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <Send className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                            <p>לא נשלחו הודעות</p>
                        </div>
                    ) : sentMessages.map(msg => <MessageItem key={msg.id} msg={msg} type="sent" />)}
                </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}