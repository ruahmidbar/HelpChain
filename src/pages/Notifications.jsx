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
  getDocs 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "../firebase/firebase";
import Button from "../Components/ui/button";
import { Card, CardContent } from "../Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Components/ui/tabs";
import Badge from "../Components/ui/badge";
import { 
  ArrowRight, 
  Mail, 
  Send, 
  Trash2, 
  CheckCircle, 
  MailOpen, 
  Clock,
  User
} from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Notifications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inbox");
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState({}); // מיפוי שמות משתמשים

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // טעינת שמות כל המשתמשים (כדי להציג שמות יפים במקום מזהים)
    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const map = {};
      usersSnap.docs.forEach(doc => {
        const d = doc.data();
        map[doc.id] = `${d.first_name || ""} ${d.last_name || ""}`.trim() || d.email;
      });
      setUsersMap(map);
    };
    fetchUsers();

    // 1. האזנה להודעות נכנסות (Inbox)
    // שים לב: אנחנו מאזינים לכל ההודעות שבהן to_user_id הוא אני
    const qInbox = query(
      collection(db, "messages"), 
      where("to_user_id", "==", user.uid)
      // הערה: הסרתי זמנית את orderBy כדי למנוע קריסה אם אין אינדקס. המיון יעשה בלקוח.
    );

    const unsubInbox = onSnapshot(qInbox, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // מיון ידני לפי תאריך (חדש לישן)
      msgs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setInboxMessages(msgs);
      setLoading(false);
    });

    // 2. האזנה להודעות יוצאות (Sent)
    // שים לב: אנחנו מאזינים לכל ההודעות שבהן from_user_id הוא אני
    const qSent = query(
      collection(db, "messages"), 
      where("from_user_id", "==", user.uid)
    );

    const unsubSent = onSnapshot(qSent, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // מיון ידני
      msgs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setSentMessages(msgs);
    });

    return () => {
      unsubInbox();
      unsubSent();
    };
  }, []);

  const handleDelete = async (msgId) => {
    if(!window.confirm("האם למחוק את ההודעה?")) return;
    try {
      await deleteDoc(doc(db, "messages", msgId));
      toast.success("ההודעה נמחקה");
    } catch (error) {
      toast.error("שגיאה במחיקה");
    }
  };

  const handleMarkAsRead = async (msgId, currentStatus) => {
    try {
      await updateDoc(doc(db, "messages", msgId), { is_read: !currentStatus });
    } catch (error) {
      console.error(error);
    }
  };

  const MessageItem = ({ msg, type }) => {
    const isInbox = type === 'inbox';
    // חישוב השם להצגה: אם זה נכנס, ממי קיבלתי. אם זה יוצא, למי שלחתי.
    const otherUserId = isInbox ? msg.from_user_id : msg.to_user_id;
    const otherUserName = usersMap[otherUserId] || "משתמש";

    return (
      <Card className={`mb-3 transition-all hover:shadow-md ${!msg.is_read && isInbox ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-full ${!msg.is_read && isInbox ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {isInbox ? <Mail className="w-5 h-5"/> : <Send className="w-5 h-5"/>}
            </div>
            <div className="min-w-0 w-full">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 truncate">{otherUserName}</span>
                    {!msg.is_read && isInbox && <Badge className="bg-blue-600 text-xs hover:bg-blue-700">חדש</Badge>}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                    <Clock className="w-3 h-3"/>
                    {msg.created_at ? new Date(msg.created_at).toLocaleString('he-IL') : ''}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{msg.content}</p>
            </div>
          </div>

          <div className="flex gap-2 self-end md:self-center ml-4">
            {isInbox && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                title={msg.is_read ? "סמן כלא נקרא" : "סמן כנקרא"}
              >
                {msg.is_read ? <MailOpen className="w-4 h-4 text-gray-400"/> : <CheckCircle className="w-4 h-4 text-blue-600"/>}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(msg.id)} 
              className="text-red-400 hover:text-red-600 hover:bg-red-50"
              title="מחק"
            >
              <Trash2 className="w-4 h-4"/>
            </Button>
          </div>

        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="p-10 text-center">טוען הודעות...</div>;

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                תיבת הודעות
            </h1>
            <p className="text-gray-600">הודעות רשמיות, בקשות ואישורים</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowRight className="w-4 h-4 ml-2" /> חזור
          </Button>
        </div>

        <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white p-1 rounded-xl shadow border">
            <TabsTrigger value="inbox">
                <Mail className="w-4 h-4 ml-2"/> 
                דואר נכנס
                {inboxMessages.filter(m => !m.is_read).length > 0 && (
                    <Badge className="mr-2 bg-red-500 hover:bg-red-600">
                        {inboxMessages.filter(m => !m.is_read).length}
                    </Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="sent">
                <Send className="w-4 h-4 ml-2"/> נשלחו
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            {inboxMessages.length === 0 ? (
                <div className="text-center py-16 bg-white/50 rounded-xl border-2 border-dashed">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                    <p className="text-gray-500">תיבת הדואר ריקה</p>
                </div>
            ) : (
                inboxMessages.map(msg => <MessageItem key={msg.id} msg={msg} type="inbox" />)
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentMessages.length === 0 ? (
                <div className="text-center py-16 bg-white/50 rounded-xl border-2 border-dashed">
                    <Send className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                    <p className="text-gray-500">לא נשלחו הודעות עדיין</p>
                </div>
            ) : (
                sentMessages.map(msg => <MessageItem key={msg.id} msg={msg} type="sent" />)
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}