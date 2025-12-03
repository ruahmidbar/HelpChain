import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Calendar as CalendarIcon, HelpCircle, HandHeart, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Calendar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: myRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['my-requests', user?.id],
    queryFn: () => user ? base44.entities.HelpRequest.filter({ requester_id: user.id }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: myOffers = [], refetch: refetchOffers } = useQuery({
    queryKey: ['my-offers', user?.id],
    queryFn: () => user ? base44.entities.HelpOffer.filter({ helper_id: user.id }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list(),
    initialData: [],
  });

  const getSubjectName = (subjectId) => {
    return subjects.find(s => s.id === subjectId)?.name || "";
  };

  const getDayName = (dayId) => {
    const days = {
      sunday: "ראשון",
      monday: "שני",
      tuesday: "שלישי",
      wednesday: "רביעי",
      thursday: "חמישי",
      friday: "שישי"
    };
    return days[dayId] || dayId;
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await base44.entities.HelpRequest.delete(requestId);
      toast.success("הבקשה נמחקה בהצלחה");
      refetchRequests();
    } catch (error) {
      toast.error("אירעה שגיאה במחיקת הבקשה");
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await base44.entities.HelpOffer.delete(offerId);
      toast.success("ההצעה נמחקה בהצלחה");
      refetchOffers();
    } catch (error) {
      toast.error("אירעה שגיאה במחיקת ההצעה");
    }
  };

  const shareWhatsApp = (type) => {
    const appUrl = window.location.origin;
    const message = `🎓 היי! רציתי לשתף אתכם באפליקציה מדהימה - HelpChain!\n\nזו פלטפורמה שמחברת תלמידים לעזרה הדדית בלימודים.\n\n✅ צריכים עזרה? תמצאו תלמידים שיעזרו לכם\n✅ רוצים לעזור? תוכלו לצבור נקודות ודרגות\n\nכנסו עכשיו: ${appUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="mb-6"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          חזור לדף הבית
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            היומן שלי
          </h1>
          <p className="text-gray-600 text-lg">כל הבקשות, ההצעות והפגישות שלך במקום אחד</p>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 p-1 rounded-xl shadow-md">
            <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <HelpCircle className="w-4 h-4 ml-2" />
              בקשות שלי
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <HandHeart className="w-4 h-4 ml-2" />
              הצעות שלי
            </TabsTrigger>
            <TabsTrigger value="meetings" className="rounded-lg data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <CalendarIcon className="w-4 h-4 ml-2" />
              פגישות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">הבקשות שלי לעזרה</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareWhatsApp('request')}
                className="gap-2"
              >
                <span>📱</span>
                הזמן חברים בוואטסאפ
              </Button>
            </div>
            {myRequests.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">אין בקשות פעילות</p>
                  <p className="text-gray-400 mb-4">כשתבקש עזרה, הבקשות שלך יופיעו כאן</p>
                  <Button onClick={() => navigate(createPageUrl("RequestHelp"))}>
                    צור בקשה חדשה
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {myRequests.map((request) => (
                  <Card key={request.id} className="bg-white/90 backdrop-blur-sm shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                          {request.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-xs font-bold text-gray-800 mb-1">תחומים:</p>
                          <div className="flex flex-wrap gap-1">
                            {request.subjects?.slice(0, 2).map((subjectId, idx) => (
                              <Badge key={idx} variant="outline" className="border-purple-300 text-xs">
                                {getSubjectName(subjectId)}
                              </Badge>
                            ))}
                            {request.subjects?.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{request.subjects.length - 2}</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 mb-0.5">תאריכים:</p>
                          <p className="text-xs text-gray-700">
                            {new Date(request.start_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })} - {new Date(request.end_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                          </p>
                        </div>
                        {request.available_hours?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-800 mb-0.5">ימים:</p>
                            <div className="flex flex-wrap gap-1">
                              {request.available_hours.slice(0, 2).map((hour, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {getDayName(hour.day)}
                                </Badge>
                              ))}
                              {request.available_hours.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{request.available_hours.length - 2}</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="offers" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">ההצעות שלי לעזרה</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareWhatsApp('offer')}
                className="gap-2"
              >
                <span>📱</span>
                הזמן חברים בוואטסאפ
              </Button>
            </div>
            {myOffers.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                <CardContent className="p-12 text-center">
                  <HandHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">אין הצעות פעילות</p>
                  <p className="text-gray-400 mb-4">כשתציע עזרה, ההצעות שלך יופיעו כאן</p>
                  <Button onClick={() => navigate(createPageUrl("OfferHelp"))}>
                    צור הצעה חדשה
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {myOffers.map((offer) => (
                  <Card key={offer.id} className="bg-white/90 backdrop-blur-sm shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-800 border-0 text-xs">
                          {offer.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-xs font-bold text-gray-800 mb-1">תחומים:</p>
                          <div className="flex flex-wrap gap-1">
                            {offer.subjects?.slice(0, 2).map((subjectId, idx) => (
                              <Badge key={idx} variant="outline" className="border-purple-300 text-xs">
                                {getSubjectName(subjectId)}
                              </Badge>
                            ))}
                            {offer.subjects?.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{offer.subjects.length - 2}</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 mb-0.5">תאריכים:</p>
                          <p className="text-xs text-gray-700">
                            {new Date(offer.start_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })} - {new Date(offer.end_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-xs text-gray-700">
                          <p><span className="font-bold">משך:</span> {offer.lesson_duration} דק'</p>
                          <p><span className="font-bold">מקום:</span> {offer.custom_place || offer.meeting_place}</p>
                        </div>
                        {offer.available_hours?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-800 mb-0.5">ימים:</p>
                            <div className="flex flex-wrap gap-1">
                              {offer.available_hours.slice(0, 2).map((hour, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {getDayName(hour.day)}
                                </Badge>
                              ))}
                              {offer.available_hours.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{offer.available_hours.length - 2}</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meetings">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">אין פגישות מתוזמנות</p>
                <p className="text-gray-400">כשתקבע פגישות עם תלמידים אחרים, הן יופיעו כאן</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}