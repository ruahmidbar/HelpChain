import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy, Star, Award, Gift } from "lucide-react";

export default function RewardsInfo() {
  const navigate = useNavigate();

  const ranks = [
    { name: "הלפר", points: "0-50", color: "bg-gray-100 text-gray-800", icon: Star },
    { name: "מנטור", points: "51-150", color: "bg-blue-100 text-blue-800", icon: Award },
    { name: "מנטור בכיר", points: "151-300", color: "bg-purple-100 text-purple-800", icon: Trophy },
    { name: "מאסטר", points: "300+", color: "bg-yellow-100 text-yellow-800", icon: Gift },
  ];

  const rewards = [
    { title: "הכרה בבית הספר", description: "שמך יופיע בלוח הכבוד של בית הספר" },
    { title: "תעודות הוקרה", description: "תעודות הוקרה מיוחדות למצטיינים" },
    { title: "פעילויות בונוס", description: "הזמנה לפעילויות מיוחדות לתלמידים מצטיינים" },
    { title: "המלצות למורים", description: "המלצות חיוביות למורים ולהנהלה" },
    { title: "בונוס בציון", description: "נקודות בונוס בציון הסופי במקצועות נבחרים" },
    { title: "הערכה בתעודה", description: "הערה מיוחדת בתעודה על תרומה לקהילה" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-4xl mx-auto">
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
            מערכת הניקוד והדרגות
          </h1>
          <p className="text-gray-600 text-lg">איך צוברים נקודות ומה מקבלים בתמורה</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">איך צוברים נקודות?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">10</span>
              </div>
              <div>
                <h3 className="font-bold">מתן שיעור עזרה</h3>
                <p className="text-gray-600">על כל שיעור שאתה נותן לתלמיד אחר</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">5</span>
              </div>
              <div>
                <h3 className="font-bold">השתתפות פעילה</h3>
                <p className="text-gray-600">על פרסום הצעות עזרה ותגובה לבקשות</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">20</span>
              </div>
              <div>
                <h3 className="font-bold">משוב חיובי</h3>
                <p className="text-gray-600">כשתלמיד שקיבל ממך עזרה נותן לך משוב מצוין</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">הדרגות במערכת</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ranks.map((rank, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-12 h-12 ${rank.color} rounded-xl flex items-center justify-center`}>
                    <rank.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{rank.name}</h3>
                    <p className="text-sm text-gray-600">{rank.points} נקודות</p>
                  </div>
                  <Badge className={rank.color}>דרגה {index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-l from-yellow-50 to-orange-50 border-yellow-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">מה מקבלים בתמורה?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {rewards.map((reward, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold mb-2 text-purple-700">{reward.title}</h3>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-white rounded-xl">
              <p className="text-center text-gray-700">
                <strong>חשוב לדעת:</strong> ההטבות והתמורות נקבעות על ידי הנהלת בית הספר ועשויות להשתנות בין בתי ספר שונים.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}