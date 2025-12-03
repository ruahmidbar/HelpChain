import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "../../firebase/firebase";
import { Button } from "../../Components/ui/button"; // וודא נתיב
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { ArrowRight, FileText, Award } from "lucide-react";
import { toast } from "sonner";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export default function Reports() {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [helpOffers, setHelpOffers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // טעינת נתונים ראשונית
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // בדיקת הרשאות אדמין
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
          
          // שליפת כל המשתמשים
          const usersSnap = await getDocs(collection(db, "users"));
          setStudents(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          // שליפת בקשות והצעות (אם הקולקשנים קיימים)
          try {
            const reqSnap = await getDocs(collection(db, "help_requests"));
            setHelpRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            
            const offSnap = await getDocs(collection(db, "help_offers"));
            setHelpOffers(offSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          } catch (e) {
            console.log("Collections might be empty yet");
          }

        } else {
          toast.error("אין לך הרשאה לצפות בדוח זה");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const filteredStudents = students.filter(s => 
    s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentRequests = (studentId) => helpRequests.filter(r => r.requester_id === studentId);
  const getStudentOffers = (studentId) => helpOffers.filter(o => o.helper_id === studentId);

  if (loading) return <div className="text-center p-10">טוען נתונים...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ניתוח ודוחות
                </h1>
                <p className="text-gray-600">צפייה בפעילות תלמידים</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowRight className="w-4 h-4 ml-2" /> חזרה
            </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* רשימת תלמידים */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl h-fit">
            <CardHeader><CardTitle>בחר תלמיד</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>חיפוש</Label>
                <Input
                  placeholder="שם או אימייל..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-right p-3 rounded-xl transition-colors ${selectedStudent?.id === student.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
                  >
                    <p className="font-medium">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* פרטי תלמיד נבחר */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedStudent ? (
              <Card className="text-center p-12 bg-white/50 border-dashed border-2">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">בחר תלמיד מהרשימה כדי לראות פרטים</p>
              </Card>
            ) : (
              <>
                <Card className="bg-gradient-to-l from-yellow-50 to-orange-50 border-yellow-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{selectedStudent.first_name} {selectedStudent.last_name}</span>
                      <Award className="text-yellow-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <p className="text-xs text-gray-500">נקודות</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedStudent.points || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <p className="text-xs text-gray-500">דרגה</p>
                        <p className="text-lg font-bold text-yellow-600">{selectedStudent.rank || "הלפר"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <p className="text-xs text-gray-500">כיתה</p>
                        <p className="text-lg font-bold text-blue-600">{selectedStudent.grade || "-"}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>בקשות ({getStudentRequests(selectedStudent.id).length})</CardTitle></CardHeader>
                        <CardContent>
                            {getStudentRequests(selectedStudent.id).length === 0 ? <p className="text-gray-400 text-center">אין בקשות</p> : 
                             getStudentRequests(selectedStudent.id).map(r => (
                                <div key={r.id} className="bg-blue-50 p-2 rounded mb-2 text-sm">{r.status}</div>
                             ))
                            }
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>הצעות ({getStudentOffers(selectedStudent.id).length})</CardTitle></CardHeader>
                        <CardContent>
                            {getStudentOffers(selectedStudent.id).length === 0 ? <p className="text-gray-400 text-center">אין הצעות</p> : 
                             getStudentOffers(selectedStudent.id).map(o => (
                                <div key={o.id} className="bg-purple-50 p-2 rounded mb-2 text-sm">{o.status}</div>
                             ))
                            }
                        </CardContent>
                    </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}