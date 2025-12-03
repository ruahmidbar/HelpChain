import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function SendMessageDialog({ targetUserId, requestData, type = "בקשת_עזרה" }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: "",
    proposed_date: "",
    proposed_time: "",
    duration: "60",
    place: "",
    message: ""
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list(),
    initialData: [],
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Notification.create(data);
      
      // שליחת מייל למשתמש המקבל
      const targetUser = await base44.entities.User.list();
      const recipient = targetUser.find(u => u.id === targetUserId);
      
      if (recipient?.email) {
        const subjectName = subjects.find(s => s.id === data.subject_id)?.name || "";
        await base44.integrations.Core.SendEmail({
          to: recipient.email,
          subject: `הודעה חדשה מ-${currentUser.first_name} ${currentUser.last_name} - HelpChain`,
          body: `
שלום ${recipient.first_name},

קיבלת ${type === "בקשת_עזרה" ? "בקשת עזרה" : "הצעת עזרה"} חדשה!

שולח: ${currentUser.first_name} ${currentUser.last_name}
מקצוע: ${subjectName}
תאריך מוצע: ${new Date(data.proposed_date).toLocaleDateString('he-IL')}
שעה: ${data.proposed_time}
משך: ${data.duration} דקות
מקום: ${data.place}

${data.study_material ? `חומר לימוד: ${data.study_material}\n` : ''}
${data.message ? `הודעה: ${data.message}\n` : ''}

היכנס לאפליקציה כדי לאשר או לדחות את הפגישה.

בהצלחה,
צוות HelpChain
          `
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success("ההודעה נשלחה בהצלחה!");
      setOpen(false);
      setFormData({
        subject_id: "",
        proposed_date: "",
        proposed_time: "",
        duration: "60",
        place: "",
        message: ""
      });
    },
    onError: () => {
      toast.error("אירעה שגיאה בשליחת ההודעה");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.subject_id || !formData.proposed_date || !formData.proposed_time || !formData.place) {
      toast.error("נא למלא את כל השדות החובה");
      return;
    }

    sendNotificationMutation.mutate({
      to_user_id: targetUserId,
      from_user_id: currentUser.id,
      type,
      subject_id: formData.subject_id,
      study_material: requestData?.study_material || "",
      proposed_date: formData.proposed_date,
      proposed_time: formData.proposed_time,
      duration: formData.duration,
      place: formData.place,
      message: formData.message,
      status: "ממתין",
      is_read: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-l from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
          <MessageCircle className="w-4 h-4 ml-2" />
          שלח הודעה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>שלח {type === "בקשת_עזרה" ? "בקשת עזרה" : "הצעת עזרה"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>מקצוע *</Label>
            <Select value={formData.subject_id} onValueChange={(val) => setFormData({...formData, subject_id: val})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="בחר מקצוע" />
              </SelectTrigger>
              <SelectContent>
                {requestData?.subjects?.map(subId => {
                  const subject = subjects.find(s => s.id === subId);
                  return subject ? (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>תאריך *</Label>
              <Input
                type="date"
                value={formData.proposed_date}
                onChange={(e) => setFormData({...formData, proposed_date: e.target.value})}
                className="mt-2"
              />
            </div>
            <div>
              <Label>שעה *</Label>
              <Input
                type="time"
                value={formData.proposed_time}
                onChange={(e) => setFormData({...formData, proposed_time: e.target.value})}
                onClick={(e) => e.target.showPicker?.()}
                className="mt-2 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>משך (דקות) *</Label>
              <Select value={formData.duration} onValueChange={(val) => setFormData({...formData, duration: val})}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 דקות</SelectItem>
                  <SelectItem value="45">45 דקות</SelectItem>
                  <SelectItem value="60">60 דקות</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>מקום *</Label>
              <Input
                value={formData.place}
                onChange={(e) => setFormData({...formData, place: e.target.value})}
                placeholder="לדוגמה: ספרייה"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label>הודעה (אופציונלי)</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="הוסף הודעה אישית..."
              className="mt-2 min-h-[80px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={sendNotificationMutation.isLoading}>
            שלח הודעה
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}