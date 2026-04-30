import { useLayoutEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Phone, AlertCircle, Heart, Brain, Flame, Droplet, Zap, Clock, Trash2 } from "lucide-react";
import { useEmergencyContacts } from "../hooks/useEmergencyContacts";
import { useAuth } from "../auth/AuthProvider";
import { useAppLanguage } from "../lib/language";

const emergencyTips = [
  {
    icon: Heart,
    title: "Check for Breathing",
    description: "If person is unconscious, check if they're breathing. Start CPR if needed.",
    color: "bg-red-50",
  },
  {
    icon: Droplet,
    title: "Stop Heavy Bleeding",
    description: "Apply firm pressure with clean cloth. Don't remove if blood soaks through - add more layers.",
    color: "bg-red-50",
  },
  {
    icon: Brain,
    title: "Head Injuries",
    description: "Keep person still. Don't move unless necessary. Watch for confusion or drowsiness.",
    color: "bg-purple-50",
  },
  {
    icon: Flame,
    title: "Severe Burns",
    description: "Cool with running water for 20 min. Cover with clean cloth. Don't apply ice or ointments.",
    color: "bg-orange-50",
  },
  {
    icon: Zap,
    title: "Poisoning",
    description: "Call poison control immediately. Don't induce vomiting unless told to do so.",
    color: "bg-yellow-50",
  },
  {
    icon: Clock,
    title: "Time is Critical",
    description: "Stay calm. Provide clear information to emergency services. Every second counts.",
    color: "bg-blue-50",
  },
];

const emergencyNumbers = [
  { service: "MERS 999", number: "999", description: "Malaysia emergency line: Police, Fire, Ambulance" },
  { service: "Emergency (Mobile)", number: "112", description: "Call from mobile if 999 is unreachable" },
  { service: "Talian Kasih", number: "15999", description: "Social support and crisis assistance" },
  { service: "Befrienders KL", number: "+603-76272929", description: "Emotional support hotline" },
  { service: "National Poison Centre", number: "+604-6570099", description: "Poison exposure advice" },
];

export function Emergency() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contacts, loading, addContact, deleteContact } = useEmergencyContacts();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? {
        title: "Bantuan Kecemasan",
        subtitle: "Akses pantas ke perkhidmatan kecemasan",
        callNow: "PANGGIL 999",
        tapToCall: "Tekan untuk menghubungi perkhidmatan kecemasan",
        emergencyContacts: "Nombor Kecemasan Malaysia",
        yourContacts: "Kenalan Kecemasan Anda",
        signInHint: "Log masuk untuk menyimpan kenalan kecemasan anda sendiri. Butang panggilan kecemasan di atas masih tersedia untuk semua orang.",
        fillAllFields: "Sila isi semua maklumat kenalan.",
        saved: "Kenalan kecemasan disimpan.",
        saveFailed: "Tidak dapat menyimpan kenalan.",
        name: "Nama",
        relationship: "Hubungan",
        phoneNumber: "Nombor telefon",
        saveContact: "Simpan Kenalan",
        loadingContacts: "Memuatkan kenalan...",
        noContacts: "Belum ada kenalan. Tambah sekurang-kurangnya seorang yang dipercayai.",
        quickTips: "Tip Kecemasan Pantas",
        important: "Penting",
        importantText: "Tip ini hanya sebagai panduan. Sentiasa hubungi perkhidmatan kecemasan untuk situasi serius. Kekal di talian dan ikut arahan mereka dengan teliti.",
      }
    : {
        title: "Emergency Help",
        subtitle: "Quick access to emergency services",
        callNow: "CALL 999",
        tapToCall: "Tap to call emergency services",
        emergencyContacts: "Malaysia Emergency Contacts",
        yourContacts: "Your Emergency Contacts",
        signInHint: "Sign in to save your own emergency contacts. The emergency call buttons above are still available for everyone.",
        fillAllFields: "Please fill in all contact fields.",
        saved: "Emergency contact saved.",
        saveFailed: "Unable to save contact.",
        name: "Name",
        relationship: "Relationship",
        phoneNumber: "Phone number",
        saveContact: "Save Contact",
        loadingContacts: "Loading contacts...",
        noContacts: "No contacts yet. Add at least one trusted person.",
        quickTips: "Quick Emergency Tips",
        important: "Important",
        importantText: "These tips are for guidance only. Always call emergency services for serious situations. Stay on the line and follow their instructions carefully.",
      };
  const localizedEmergencyTips = language === "ms"
    ? [
        { icon: Heart, title: "Periksa Pernafasan", description: "Jika mangsa tidak sedarkan diri, periksa sama ada mereka bernafas. Mulakan CPR jika perlu.", color: "bg-red-50" },
        { icon: Droplet, title: "Hentikan Pendarahan Banyak", description: "Tekan dengan kuat menggunakan kain bersih. Jangan buang lapisan yang penuh darah - tambah lapisan baharu.", color: "bg-red-50" },
        { icon: Brain, title: "Kecederaan Kepala", description: "Pastikan mangsa tidak banyak bergerak. Jangan alihkan kecuali perlu. Perhatikan kekeliruan atau mengantuk.", color: "bg-purple-50" },
        { icon: Flame, title: "Lecur Teruk", description: "Sejukkan dengan air mengalir selama 20 minit. Tutup dengan kain bersih. Jangan letak ais atau salap.", color: "bg-orange-50" },
        { icon: Zap, title: "Keracunan", description: "Hubungi pusat racun segera. Jangan paksa muntah kecuali diarahkan berbuat demikian.", color: "bg-yellow-50" },
        { icon: Clock, title: "Masa Sangat Kritikal", description: "Kekal tenang. Berikan maklumat yang jelas kepada perkhidmatan kecemasan. Setiap saat amat penting.", color: "bg-blue-50" },
      ]
    : emergencyTips;
  const localizedEmergencyNumbers = language === "ms"
    ? [
        { service: "MERS 999", number: "999", description: "Talian kecemasan Malaysia: Polis, Bomba, Ambulans" },
        { service: "Kecemasan (Telefon Bimbit)", number: "112", description: "Hubungi melalui telefon bimbit jika 999 tidak dapat dicapai" },
        { service: "Talian Kasih", number: "15999", description: "Sokongan sosial dan bantuan krisis" },
        { service: "Befrienders KL", number: "+603-76272929", description: "Talian sokongan emosi" },
        { service: "Pusat Racun Negara", number: "+604-6570099", description: "Nasihat pendedahan racun" },
      ]
    : emergencyNumbers;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const handleCall = (number: string) => {
    const dialable = number.replace(/[^\d+]/g, "");
    window.location.href = `tel:${dialable}`;
  };

  const handleAddContact = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      setMessage(t.fillAllFields);
      return;
    }

    try {
      await addContact({
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim(),
      });
      setName("");
      setPhone("");
      setRelationship("");
      setMessage(t.saved);
    } catch (error: any) {
      setMessage(error.message ?? t.saveFailed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 pt-12 pb-6 sticky top-0 z-10 shadow-lg">
        <button
          onClick={() => navigate(user ? "/app" : "/login")}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-red-100">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Emergency Call Button */}
      <div className="px-6 py-6">
        <button
          onClick={() => handleCall("999")}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-6 rounded-3xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all border-4 border-red-300"
        >
          <Phone className="w-12 h-12 mx-auto mb-2" />
          <span className="text-3xl font-bold block">{t.callNow}</span>
          <span className="text-sm text-red-100 mt-1 block">{t.tapToCall}</span>
        </button>
      </div>

      {/* Other Emergency Numbers */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t.emergencyContacts}</h2>
        <div className="space-y-3">
          {localizedEmergencyNumbers.map((contact) => (
            <button
              key={contact.number}
              onClick={() => handleCall(contact.number)}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 hover:shadow-md active:scale-95 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{contact.service}</h3>
                  <p className="text-sm text-gray-600 mb-1">{contact.description}</p>
                  <p className="text-lg font-bold text-blue-600">{contact.number}</p>
                </div>
                <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 ml-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">{t.yourContacts}</h2>

        {!user ? (
          <div className="bg-white rounded-2xl border border-amber-200 p-4 text-sm text-amber-900">
            {t.signInHint}
          </div>
        ) : (
          <>
            <form onSubmit={handleAddContact} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 mb-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.name}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
                placeholder={t.relationship}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={t.phoneNumber}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold"
              >
                {t.saveContact}
              </button>
            </form>

            {message ? <p className="text-xs text-gray-600 mb-2">{message}</p> : null}

            <div className="space-y-2">
              {loading ? <p className="text-sm text-gray-500">{t.loadingContacts}</p> : null}
              {!loading && contacts.length === 0 ? (
                <p className="text-sm text-gray-500">{t.noContacts}</p>
              ) : null}

              {contacts.map((contact) => (
                <div key={contact.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                  <button
                    onClick={() => handleCall(contact.phone)}
                    className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-700"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-600">{contact.relationship}</p>
                    <p className="text-sm text-blue-700 font-medium">{contact.phone}</p>
                  </div>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600"
                    aria-label={`Delete ${contact.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Emergency Tips */}
      <div className="px-6 pb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          {t.quickTips}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {localizedEmergencyTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className={`${tip.color} border border-gray-200 rounded-2xl p-4`}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notice */}
        <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t.important}
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            {t.importantText}
          </p>
        </div>
      </div>
    </div>
  );
}
