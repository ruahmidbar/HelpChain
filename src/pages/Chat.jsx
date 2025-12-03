import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy, 
  updateDoc, 
  doc, 
  getDocs 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "../firebase/firebase";

// --- תיקוני ייבוא קריטיים ---
import Button from "../Components/ui/button"; // בלי סוגריים
import Badge from "../Components/ui/badge";   // בלי סוגריים
import { Input } from "../Components/ui/input"; // Input בדרך כלל עם סוגריים, אם זה עושה שגיאה תוריד אותם
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";

import { ArrowRight, Send, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  // 1. טעינת משתמש ורשימת אנשי קשר
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    setCurrentUser(user);

    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const allUsers = usersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== user.uid);
        setUsersList(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // 2. האזנה להודעות שלא נקראו
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "messages"), 
      where("to_user_id", "==", currentUser.uid),
      where("is_read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.from_user_id) {
            counts[data.from_user_id] = (counts[data.from_user_id] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. טעינת השיחה
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const q = query(collection(db, "messages"), orderBy("created_at", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversation = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => 
          (msg.from_user_id === currentUser.uid && msg.to_user_id === selectedUser.id) ||
          (msg.from_user_id === selectedUser.id && msg.to_user_id === currentUser.uid)
        );
      
      setMessages(conversation);
      
      // סימון כנקרא
      conversation.forEach(msg => {
        if (msg.to_user_id === currentUser.uid && !msg.is_read) {
          updateDoc(doc(db, "messages", msg.id), { is_read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        from_user_id: currentUser.uid,
        from_user_name: currentUser.displayName || "משתמש",
        to_user_id: selectedUser.id,
        to_user_name: selectedUser.first_name || "משתמש",
        content: messageText,
        type: "הודעה רגילה",
        is_read: false,
        created_at: new Date().toISOString()
      });
      setMessageText("");
    } catch (error) {
      toast.error("שגיאה בשליחה");
    }
  };

  const getUserName = (user) => {
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.email;
  };

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 z-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-4 pt-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="bg-white shadow-md"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לדף הבית
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            צ'אט
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">אנשי קשר</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {usersList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין משתמשים אחרים</p>
              ) : (
                usersList.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-right p-4 border-b flex justify-between items-center transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-purple-50 border-r-4 border-r-purple-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 p-2 rounded-full text-gray-600">
                        <User className="w-4 h-4"/>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{getUserName(user)}</p>
                        <p className="text-xs text-gray-500 truncate w-24">
                           {user.role === 'admin' ? 'מנהל' : 'תלמיד'}
                        </p>
                      </div>
                    </div>
                    {unreadCounts[user.id] > 0 && (
                      <Badge className="bg-red-500 text-white rounded-full px-2">
                        {unreadCounts[user.id]}
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl flex flex-col">
            {!selectedUser ? (
              <CardContent className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-purple-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">בחר שיחה</h3>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b bg-white rounded-t-xl py-3 px-4 shadow-sm z-10">
                  <CardTitle className="text-base">{getUserName(selectedUser)}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-gray-50">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.from_user_id === currentUser.uid;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tr-none'}`}>
                              <p>{msg.content}</p>
                              <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 bg-white border-t flex gap-2">
                    <Input 
                        value={messageText} 
                        onChange={(e) => setMessageText(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                        placeholder="הקלד..." 
                        className="flex-1 rounded-full" 
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="rounded-full w-10 h-10 p-0">
                        <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}