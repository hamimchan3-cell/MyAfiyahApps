import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HeartPulse } from "lucide-react";
import { useAppLanguage } from "../lib/language";

export function Splash() {
  const navigate = useNavigate();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? { subtitle: "Teman Kesihatan Anda" }
    : { subtitle: "Your Health Companion" };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <div className="animate-bounce">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
          <HeartPulse className="w-14 h-14 text-blue-600" />
        </div>
      </div>
      
      <h1 className="mt-8 text-5xl font-bold text-white tracking-tight">
        MyAfiyah
      </h1>
      
      <p className="mt-3 text-lg text-blue-100">
        {t.subtitle}
      </p>
      
      <div className="mt-12 flex gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
}
