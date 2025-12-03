import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../firebase/firebase"; 
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Trash2, Shield, Search, Ban, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;

      if (role !== 'admin' && role !== 'school_admin') {
        toast.error("אין לך הרשאה לצפות בעמוד זה");
        navigate("/dashboard");
        return;
      }

      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleChangeRole = async (userId, newRole) => {
    // עדכון אופטימי (מיידי) בממשק
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast.success("תפקיד עודכן בהצלחה");
    } catch (e) {
      toast.error("שגיאה בעדכון");
      // ביטול השינוי אם נכשל
      const originalUser = users.find(u => u.id === userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: originalUser.role } : u));
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await updateDoc(doc(db, "users", userId), { is_blocked: !isBlocked });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: !isBlocked } : u));
      toast.success(isBlocked ? "חסימה הוסרה" : "משתמש נחסם");
    } catch (e) {
      toast.error("שגיאה בחסימה");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("האם למחוק משתמש זה?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success("משתמש נמחק");
    } catch (e) {
      toast.error("שגיאה במחיקה");
    }
  };

  const filteredUsers = users.filter(u => 
    u.first_name?.includes(searchTerm) || u.email?.includes(searchTerm)
  );

  if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="text-blue-600" /> ניהול משתמשים
        </h1>
        <Input 
            className="w-64" 
            placeholder="חיפוש לפי שם..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto"> {/* גלילה רוחבית למסכים קטנים */}
            <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                        <th className="p-4">שם</th>
                        <th className="p-4">אימייל</th>
                        <th className="p-4">תפקיד</th>
                        <th className="p-4">סטטוס</th>
                        <th className="p-4">פעולות</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="p-4 font-medium">{user.first_name} {user.last_name}</td>
                            <td className="p-4 text-gray-500 text-sm">{user.email}</td>
                            <td className="p-4">
                                {/* שימוש ב-select רגיל לפתרון בעיות תצוגה */}
                                <select 
                                    className={`
                                        block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                                        ${user.role === 'admin' ? 'bg-red-50 text-red-700 font-bold border-red-200' : ''}
                                        ${user.role === 'school_admin' ? 'bg-orange-50 text-orange-700 font-bold border-orange-200' : ''}
                                        ${user.role === 'staff' ? 'bg-purple-50 text-purple-700 font-bold border-purple-200' : ''}
                                    `}
                                    value={user.role || "student"}
                                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                >
                                    <option value="student">תלמיד/ה</option>
                                    <option value="staff">צוות ביה"ס</option>
                                    <option value="school_admin">אדמין בית ספרי</option>
                                    <option value="admin">מנהל מערכת</option>
                                </select>
                            </td>
                            <td className="p-4">
                                {user.is_blocked ? 
                                    <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">חסום</span> : 
                                    <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">פעיל</span>
                                }
                            </td>
                            <td className="p-4 flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleBlockUser(user.id, user.is_blocked)} title={user.is_blocked ? "בטל חסימה" : "חסום"}>
                                    {user.is_blocked ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-orange-500" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} title="מחק">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}