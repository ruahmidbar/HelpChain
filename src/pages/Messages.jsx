import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button"; // וודא שהנתיב תואם לתיקייה שלך
import { Card, CardContent } from "../Components/ui/card";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function Messages() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          חזור לדף הבית
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ההודעות שלי
          </h1>
          <p className="text-gray-600 text-lg">כל ההתכתבויות שלך במקום אחד</p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">אין הודעות כרגע</p>
            <p className="text-gray-400">כשתתחיל לתקשר עם תלמידים אחרים, ההודעות יופיעו כאן</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}