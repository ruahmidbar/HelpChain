import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, School, Users, BookOpen, Trash2, Plus, Upload, Edit2, Info } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newSchool, setNewSchool] = useState({ name: "", city: "" });
  const [newGrade, setNewGrade] = useState({ name: "", school_id: "" });
  const [newSubject, setNewSubject] = useState({ name: "", category: "" });
  const [editingSchool, setEditingSchool] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [showUploadHelp, setShowUploadHelp] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: () => base44.entities.School.list(),
    initialData: [],
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: () => base44.entities.Grade.list(),
    initialData: [],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list(),
    initialData: [],
  });

  const createSchoolMutation = useMutation({
    mutationFn: (data) => base44.entities.School.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['schools']);
      setNewSchool({ name: "", city: "" });
      toast.success("בית הספר נוסף בהצלחה");
    },
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: (id) => base44.entities.School.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['schools']);
      toast.success("בית הספר נמחק בהצלחה");
    },
  });

  const createGradeMutation = useMutation({
    mutationFn: (data) => base44.entities.Grade.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['grades']);
      setNewGrade({ name: "", school_id: "" });
      toast.success("הכיתה נוספה בהצלחה");
    },
  });

  const deleteGradeMutation = useMutation({
    mutationFn: (id) => base44.entities.Grade.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['grades']);
      toast.success("הכיתה נמחקה בהצלחה");
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      setNewSubject({ name: "", category: "" });
      toast.success("המקצוע נוסף בהצלחה");
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id) => base44.entities.Subject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      toast.success("המקצוע נמחק בהצלחה");
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.School.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['schools']);
      setEditingSchool(null);
      toast.success("בית הספר עודכן בהצלחה");
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { user_role: role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('הרשאת משתמש עודכנה בהצלחה');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => base44.entities.User.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      toast.success('משתמש נמחק בהצלחה');
    },
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Grade.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['grades']);
      setEditingGrade(null);
      toast.success("הכיתה עודכנה בהצלחה");
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            schools: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  city: { type: "string" }
                }
              }
            },
            grades: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  school_name: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.status === "success" && result.output) {
        if (result.output.schools) {
          await base44.entities.School.bulkCreate(result.output.schools);
        }
        if (result.output.grades) {
          for (const grade of result.output.grades) {
            const school = schools.find(s => s.name === grade.school_name);
            if (school) {
              await base44.entities.Grade.create({
                name: grade.name,
                school_id: school.id
              });
            }
          }
        }
        queryClient.invalidateQueries(['schools']);
        queryClient.invalidateQueries(['grades']);
        toast.success("הקובץ הועלה בהצלחה!");
      } else {
        toast.error("שגיאה בעיבוד הקובץ");
      }
    } catch (error) {
      toast.error("שגיאה בהעלאת הקובץ");
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center" dir="rtl">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">גישה נדחתה</h2>
            <p className="text-gray-600 mb-6">רק מנהלים יכולים לגשת לדף זה</p>
            <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
              חזור לדף הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 z-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-4 pt-2">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-white shadow-md"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לדף הבית
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            פאנל ניהול
          </h1>
          <p className="text-gray-600 text-lg">ניהול בתי ספר, כיתות ומקצועות</p>
        </div>

        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 p-1 rounded-xl shadow-md">
            <TabsTrigger value="schools">
              <School className="w-4 h-4 ml-2" />
              בתי ספר
            </TabsTrigger>
            <TabsTrigger value="grades">
              <Users className="w-4 h-4 ml-2" />
              כיתות
            </TabsTrigger>
            <TabsTrigger value="subjects">
              <BookOpen className="w-4 h-4 ml-2" />
              מקצועות
            </TabsTrigger>
            <TabsTrigger value="users">משתמשים</TabsTrigger>
          </TabsList>

          <TabsContent value="schools">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>הוסף בית ספר חדש או העלה קובץ</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadHelp(!showUploadHelp)}
                >
                  <Info className="w-4 h-4 ml-2" />
                  עזרה
                </Button>
              </CardHeader>
              <CardContent>
                {showUploadHelp && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      <p className="font-bold mb-2">פורמט קובץ CSV/XLSX:</p>
                      <p className="mb-2">גיליון 1 - בתי ספר (עמודות: name, city)</p>
                      <p className="mb-2">גיליון 2 - כיתות (עמודות: name, school_name)</p>
                      <p className="text-sm text-gray-600">דוגמה: name=בית ספר תיכון, city=תל אביב</p>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="mb-4">
                  <Label>העלה קובץ CSV/XLSX</Label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <Label className="text-lg mb-4 block">או הוסף ידנית:</Label>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>שם בית הספר</Label>
                    <Input
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                      placeholder="הכנס שם בית ספר"
                    />
                  </div>
                  <div>
                    <Label>עיר</Label>
                    <Input
                      value={newSchool.city}
                      onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })}
                      placeholder="הכנס עיר"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => createSchoolMutation.mutate(newSchool)}
                  disabled={!newSchool.name || !newSchool.city}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף בית ספר
                </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {schools.map((school) => (
                <Card key={school.id} className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4">
                    {editingSchool?.id === school.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingSchool.name}
                          onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                          placeholder="שם בית הספר"
                        />
                        <Input
                          value={editingSchool.city}
                          onChange={(e) => setEditingSchool({ ...editingSchool, city: e.target.value })}
                          placeholder="עיר"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateSchoolMutation.mutate({ 
                              id: school.id, 
                              data: { name: editingSchool.name, city: editingSchool.city }
                            })}
                          >
                            שמור
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSchool(null)}
                          >
                            בטל
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">{school.name}</h3>
                          <p className="text-sm text-gray-600">{school.city}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingSchool(school)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSchoolMutation.mutate(school.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="grades">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
              <CardHeader>
                <CardTitle>הוסף כיתה חדשה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>שם הכיתה</Label>
                    <Input
                      value={newGrade.name}
                      onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                      placeholder="לדוגמה: כיתה ז1"
                    />
                  </div>
                  <div>
                    <Label>בית ספר</Label>
                    <Select
                      value={newGrade.school_id}
                      onValueChange={(value) => setNewGrade({ ...newGrade, school_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר בית ספר" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name} - {school.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => createGradeMutation.mutate(newGrade)}
                  disabled={!newGrade.name || !newGrade.school_id}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף כיתה
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {grades.map((grade) => {
                const school = schools.find(s => s.id === grade.school_id);
                return (
                  <Card key={grade.id} className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      {editingGrade?.id === grade.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editingGrade.name}
                            onChange={(e) => setEditingGrade({ ...editingGrade, name: e.target.value })}
                            placeholder="שם הכיתה"
                          />
                          <Select
                            value={editingGrade.school_id}
                            onValueChange={(value) => setEditingGrade({ ...editingGrade, school_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="בחר בית ספר" />
                            </SelectTrigger>
                            <SelectContent>
                              {schools.map((school) => (
                                <SelectItem key={school.id} value={school.id}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateGradeMutation.mutate({ 
                                id: grade.id, 
                                data: { name: editingGrade.name, school_id: editingGrade.school_id }
                              })}
                            >
                              שמור
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingGrade(null)}
                            >
                              בטל
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold">{grade.name}</h3>
                            <p className="text-sm text-gray-600">
                              {school?.name || "בית ספר לא ידוע"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingGrade(grade)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteGradeMutation.mutate(grade.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="subjects">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
              <CardHeader>
                <CardTitle>הוסף מקצוע חדש</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>שם המקצוע</Label>
                    <Input
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="לדוגמה: מתמטיקה"
                    />
                  </div>
                  <div>
                    <Label>קטגוריה</Label>
                    <Select
                      value={newSubject.category}
                      onValueChange={(value) => setNewSubject({ ...newSubject, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="מדעים">מדעים</SelectItem>
                        <SelectItem value="שפות">שפות</SelectItem>
                        <SelectItem value="מדעי החברה">מדעי החברה</SelectItem>
                        <SelectItem value="אומנויות">אומנויות</SelectItem>
                        <SelectItem value="אחר">אחר</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => createSubjectMutation.mutate(newSubject)}
                  disabled={!newSubject.name}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף מקצוע
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card key={subject.id} className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{subject.name}</h3>
                      <p className="text-sm text-gray-600">{subject.category || "ללא קטגוריה"}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSubjectMutation.mutate(subject.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>ניהול הרשאות משתמשים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {allUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {u.first_name && u.last_name 
                            ? `${u.first_name} ${u.last_name}` 
                            : u.full_name || u.email}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={u.user_role || "תלמיד"}
                          onValueChange={(role) => updateUserRoleMutation.mutate({ userId: u.id, role })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="תלמיד">תלמיד</SelectItem>
                            <SelectItem value="צוות ביה&quot;ס">צוות ביה"ס</SelectItem>
                            <SelectItem value="אדמין">אדמין</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUserMutation.mutate(u.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}