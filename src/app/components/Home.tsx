import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Book,
  ChevronDown,
  CircleUserRound,
  Eye,
  EyeOff,
  Globe2,
  HeartPulse,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  X,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../auth/AuthProvider";
import { useUserProgress } from "../hooks/useUserProgress";
import { useAppLanguage } from "../lib/language";

const quickAccessCardMeta = [
  {
    id: "tools",
    icon: Stethoscope,
    path: "/app/first-aid-tools",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "guides",
    icon: Book,
    path: "/app/treatment-guides",
    color: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    id: "emergency",
    icon: Phone,
    path: "/app/emergency",
    color: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    id: "hospitals",
    icon: MapPin,
    path: "/app/nearby-hospitals",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

type PasswordVerificationMethod = "none" | "email" | "phone";

const homeCopy = {
  en: {
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
    readyToLearn: "Ready to learn and help?",
    yourHealthCompanion: "Your Health Companion",
    quickAccess: "Quick Access",
    firstAidToolsTitle: "First Aid Tools",
    firstAidToolsDescription: "Learn about basic medical tools",
    treatmentGuidesTitle: "Treatment Guides",
    treatmentGuidesDescription: "Step-by-step treatment instructions",
    emergencyCardTitle: "Emergency Help",
    emergencyCardDescription: "Quick access to emergency services",
    hospitalsTitle: "Find Hospitals",
    hospitalsDescription: "Locate nearby medical facilities",
    emergencyHelp: "EMERGENCY HELP",
    toolsCompleted: "Tools Completed",
    guidesCompleted: "Guides Completed",
    loggedInAs: "Logged in as",
    viewProfile: "View Profile",
    phoneSetupTitle: "Phone Number Setup",
    phoneSetupHelp: "Add or update your phone number for profile and emergency contact use. No OTP is required.",
    phoneNumberLabel: "Phone number",
    phonePlaceholderLocal: "0123456789",
    malaysiaPhoneHint: "Malaysia only — enter your number without the country code.",
    sendPhoneOtp: "Save Phone Number",
    phoneSetupOtpSent: "Phone number saved to your profile successfully. No OTP is needed.",
    verifySavePhone: "Save Phone Number",
    phoneUpdated: "Phone number saved successfully.",
    enterPhoneNumberFirst: "Enter your phone number first.",
    savePhoneFailed: "Unable to save the phone number.",
    sendingOtp: "Saving...",
    languageEnglish: "Language : English",
    languageBahasa: "Bahasa : Bahasa Melayu",
    didYouKnow: "Did You Know?",
    didYouKnowText: "Learning basic first aid can help you respond effectively in emergencies and potentially save someone's life. Every second counts!",
    profile: "Profile",
    profileSubtitle: "Account details and security",
    accountDetails: "Account Details",
    noEmailLinked: "No email linked yet",
    noPhoneLinked: "No phone linked yet",
    administrator: "Administrator",
    standardUser: "Standard user",
    guestUser: "Guest user",
    guestAccount: "Guest profile",
    guestLocalOnlyNote: "This guest profile stays on this device only. If the app is uninstalled or local data is cleared, saved progress and emergency contacts will be lost.",
    registeredSyncNote: "Email accounts can sign in on other devices and keep their saved data.",
    securePasswordChange: "Secure Password Change",
    securePasswordHelp: "For security, use the email reset flow to change your password.",
    sendToEmail: "Send to Email",
    sendOtpToPhone: "Send OTP to Phone",
    emailResetHint: "Check your email for the secure reset step, then open the reset page to set a new password.",
    phoneOtp: "Phone OTP",
    enterOtp: "Enter 6-digit OTP",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    verifying: "Verifying...",
    verifySavePassword: "Verify & Save Password",
    logout: "Logout",
    adminDashboard: "Admin Dashboard",
    noEmailAttached: "No email address is attached to this account yet.",
    secureResetSent: "A secure password reset link/code has been sent to your email. Open it to continue changing your password safely.",
    sendSecureResetFailed: "Unable to send the secure email reset.",
    noVerifiedPhoneYet: "No verified phone number is attached to this account yet.",
    otpSent: "A 6-digit OTP has been sent to your phone. Enter it below together with your new password.",
    sendPhoneOtpFailed: "Unable to send the phone verification OTP.",
    passwordTooShort: "Password must be at least 6 characters.",
    passwordsDoNotMatch: "Passwords do not match.",
    enterOtpFirst: "Enter the OTP sent to your phone first.",
    noVerifiedPhone: "No verified phone number is attached to this account.",
    passwordUpdated: "Password updated securely.",
    updatePasswordFailed: "Unable to update password securely.",
    requestInterrupted: "Request was interrupted. Please try again.",
    networkIssue: "Network issue detected. Please check your connection and try again.",
    phoneOtpNotConnected: "Phone OTP is not connected yet. It will work once the Supabase SMS provider is linked.",
    logoutFailed: "Unable to log out.",
    signedInAccount: "Signed in account",
    learnEssentialSkills: "Learn Essential Skills",
    bePreparedSaveLives: "Be Prepared. Save Lives.",
    firstAidTrainingAlt: "First aid training",
  },
  ms: {
    goodMorning: "Selamat Pagi",
    goodAfternoon: "Selamat Tengah Hari",
    goodEvening: "Selamat Malam",
    readyToLearn: "Bersedia untuk belajar dan membantu?",
    yourHealthCompanion: "Teman Kesihatan Anda",
    quickAccess: "Akses Pantas",
    firstAidToolsTitle: "Alatan Pertolongan Cemas",
    firstAidToolsDescription: "Pelajari alatan perubatan asas",
    treatmentGuidesTitle: "Panduan Rawatan",
    treatmentGuidesDescription: "Arahan rawatan langkah demi langkah",
    emergencyCardTitle: "Bantuan Kecemasan",
    emergencyCardDescription: "Akses pantas kepada perkhidmatan kecemasan",
    hospitalsTitle: "Cari Hospital",
    hospitalsDescription: "Cari kemudahan perubatan berdekatan",
    emergencyHelp: "BANTUAN KECEMASAN",
    toolsCompleted: "Alatan Selesai",
    guidesCompleted: "Panduan Selesai",
    loggedInAs: "Log masuk sebagai",
    viewProfile: "Lihat Profil",
    phoneSetupTitle: "Tetapan Nombor Telefon",
    phoneSetupHelp: "Tambahkan atau kemas kini nombor telefon anda untuk kegunaan profil dan hubungan kecemasan. Tiada OTP diperlukan.",
    phoneNumberLabel: "Nombor telefon",
    phonePlaceholderLocal: "0123456789",
    malaysiaPhoneHint: "Malaysia sahaja — masukkan nombor tanpa kod negara.",
    sendPhoneOtp: "Simpan Nombor Telefon",
    phoneSetupOtpSent: "Nombor telefon berjaya disimpan dalam profil anda. Tiada OTP diperlukan.",
    verifySavePhone: "Simpan Nombor Telefon",
    phoneUpdated: "Nombor telefon berjaya disimpan.",
    enterPhoneNumberFirst: "Masukkan nombor telefon anda dahulu.",
    savePhoneFailed: "Tidak dapat menyimpan nombor telefon.",
    sendingOtp: "Menyimpan...",
    languageEnglish: "Language : English",
    languageBahasa: "Bahasa : Bahasa Melayu",
    didYouKnow: "Tahukah Anda?",
    didYouKnowText: "Mempelajari pertolongan cemas asas boleh membantu anda bertindak dengan berkesan semasa kecemasan dan berpotensi menyelamatkan nyawa seseorang. Setiap saat amat penting!",
    profile: "Profil",
    profileSubtitle: "Butiran akaun dan keselamatan",
    accountDetails: "Butiran Akaun",
    noEmailLinked: "Belum ada e-mel dipautkan",
    noPhoneLinked: "Belum ada nombor telefon dipautkan",
    administrator: "Pentadbir",
    standardUser: "Pengguna biasa",
    guestUser: "Pengguna tetamu",
    guestAccount: "Profil tetamu",
    guestLocalOnlyNote: "Profil tetamu ini hanya kekal pada peranti ini. Jika aplikasi dipadam atau data setempat dibersihkan, kemajuan tersimpan dan nombor kecemasan akan hilang.",
    registeredSyncNote: "Akaun e-mel boleh log masuk pada peranti lain dan mengekalkan data tersimpan mereka.",
    securePasswordChange: "Penukaran Kata Laluan Selamat",
    securePasswordHelp: "Untuk keselamatan, gunakan aliran tetapan semula e-mel untuk menukar kata laluan anda.",
    sendToEmail: "Hantar ke E-mel",
    sendOtpToPhone: "Hantar OTP ke Telefon",
    emailResetHint: "Semak e-mel anda untuk langkah tetapan semula yang selamat, kemudian buka halaman tetapan semula untuk menetapkan kata laluan baharu.",
    phoneOtp: "OTP Telefon",
    enterOtp: "Masukkan OTP 6 digit",
    newPassword: "Kata laluan baharu",
    confirmNewPassword: "Sahkan kata laluan baharu",
    verifying: "Mengesahkan...",
    verifySavePassword: "Sahkan & Simpan Kata Laluan",
    logout: "Log keluar",
    adminDashboard: "Papan Pemuka Admin",
    noEmailAttached: "Belum ada alamat e-mel yang dipautkan pada akaun ini.",
    secureResetSent: "Pautan/kod tetapan semula kata laluan yang selamat telah dihantar ke e-mel anda. Buka untuk terus menukar kata laluan dengan selamat.",
    sendSecureResetFailed: "Tidak dapat menghantar tetapan semula e-mel yang selamat.",
    noVerifiedPhoneYet: "Belum ada nombor telefon yang disahkan dipautkan pada akaun ini.",
    otpSent: "OTP 6 digit telah dihantar ke telefon anda. Masukkan di bawah bersama kata laluan baharu anda.",
    sendPhoneOtpFailed: "Tidak dapat menghantar OTP pengesahan telefon.",
    passwordTooShort: "Kata laluan mesti sekurang-kurangnya 6 aksara.",
    passwordsDoNotMatch: "Kata laluan tidak sepadan.",
    enterOtpFirst: "Masukkan OTP yang dihantar ke telefon anda dahulu.",
    noVerifiedPhone: "Tiada nombor telefon yang disahkan dipautkan pada akaun ini.",
    passwordUpdated: "Kata laluan berjaya dikemas kini dengan selamat.",
    updatePasswordFailed: "Tidak dapat mengemas kini kata laluan dengan selamat.",
    requestInterrupted: "Permintaan terganggu. Sila cuba lagi.",
    networkIssue: "Masalah rangkaian dikesan. Sila semak sambungan anda dan cuba lagi.",
    phoneOtpNotConnected: "OTP telefon belum disambungkan lagi. Ia akan berfungsi selepas penyedia SMS Supabase dipautkan.",
    logoutFailed: "Tidak dapat log keluar.",
    signedInAccount: "Akaun yang sedang log masuk",
    learnEssentialSkills: "Pelajari Kemahiran Penting",
    bePreparedSaveLives: "Bersedia. Selamatkan Nyawa.",
    firstAidTrainingAlt: "Latihan pertolongan cemas",
  },
} as const;

const toMalaysiaLocalPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("60")) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("0")) {
    return digits;
  }

  return `0${digits}`;
};

const normalizePhoneNumber = (value: string) => {
  const localPhone = toMalaysiaLocalPhone(value);
  if (!localPhone) return "";
  return `+60${localPhone.replace(/^0+/, "")}`;
};

export function Home() {
  const navigate = useNavigate();
  const { user, signOut, signInWithPhoneOtp, verifyPhoneOtp, updatePassword, updatePhoneNumber, requestPasswordReset, isAdmin, isGuest } = useAuth();
  const { completedCounts } = useUserProgress();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMethod, setPasswordMethod] = useState<PasswordVerificationMethod>("none");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneSetupOtp, setPhoneSetupOtp] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isSavingPhoneNumber, setIsSavingPhoneNumber] = useState(false);
  const [isPhoneSectionOpen, setIsPhoneSectionOpen] = useState(false);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [language, setLanguage] = useAppLanguage();
  const t = homeCopy[language];
  const quickAccessCards = useMemo(
    () => [
      {
        ...quickAccessCardMeta[0],
        title: t.firstAidToolsTitle,
        description: t.firstAidToolsDescription,
      },
      {
        ...quickAccessCardMeta[1],
        title: t.treatmentGuidesTitle,
        description: t.treatmentGuidesDescription,
      },
      {
        ...quickAccessCardMeta[2],
        title: t.emergencyCardTitle,
        description: t.emergencyCardDescription,
      },
      {
        ...quickAccessCardMeta[3],
        title: t.hospitalsTitle,
        description: t.hospitalsDescription,
      },
    ],
    [t],
  );
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? t.goodMorning
      : currentHour < 18
        ? t.goodAfternoon
        : t.goodEvening;

  const accountPhone = useMemo(() => {
    const phoneFromMetadata = typeof user?.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
    return user?.phone || phoneFromMetadata || "";
  }, [user]);

  const accountIdentifier = user?.email || accountPhone || (isGuest ? t.guestAccount : t.signedInAccount);

  useEffect(() => {
    setPhoneInput(toMalaysiaLocalPhone(accountPhone));
  }, [accountPhone]);

  useEffect(() => {
    if (!accountPhone || pendingPhone) {
      setIsPhoneSectionOpen(true);
    }
  }, [accountPhone, pendingPhone]);

  useEffect(() => {
    if (passwordMethod !== "none") {
      setIsPasswordSectionOpen(true);
    }
  }, [passwordMethod]);

  const toFriendlyMessage = (error: unknown, fallback: string) => {
    const raw = error instanceof Error ? error.message : String(error ?? "");
    const text = raw.toLowerCase();

    if (text.includes("lock broken") || text.includes("steal option")) {
      return t.requestInterrupted;
    }

    if (text.includes("network") || text.includes("fetch")) {
      return t.networkIssue;
    }

    if (text.includes("sms") || text.includes("twilio") || text.includes("phone provider")) {
      return t.phoneOtpNotConnected;
    }

    return raw || fallback;
  };

  const resetPasswordForm = () => {
    setOtpCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ms" : "en");
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error: any) {
      setProfileMessage(toFriendlyMessage(error, t.logoutFailed));
    }
  };

  const handleEmailPasswordReset = async () => {
    if (!user?.email) {
      setProfileMessage(t.noEmailAttached);
      return;
    }

    setIsSendingVerification(true);
    setProfileMessage("");
    setPasswordMethod("email");
    resetPasswordForm();

    try {
      await requestPasswordReset(user.email);
      setProfileMessage(t.secureResetSent);
    } catch (error: any) {
      setProfileMessage(toFriendlyMessage(error, t.sendSecureResetFailed));
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handlePhonePasswordVerification = async () => {
    if (!accountPhone) {
      setProfileMessage(t.noVerifiedPhoneYet);
      return;
    }

    setIsSendingVerification(true);
    setProfileMessage("");
    setPasswordMethod("phone");
    resetPasswordForm();

    try {
      await signInWithPhoneOtp(accountPhone, false);
      setProfileMessage(t.otpSent);
    } catch (error: any) {
      setProfileMessage(toFriendlyMessage(error, t.sendPhoneOtpFailed));
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleSendPhoneSetupOtp = async () => {
    const normalizedPhone = normalizePhoneNumber(phoneInput);

    if (!normalizedPhone || toMalaysiaLocalPhone(phoneInput).length < 9) {
      setProfileMessage(t.enterPhoneNumberFirst);
      return;
    }

    setIsSendingPhoneOtp(true);
    setProfileMessage("");

    try {
      await updatePhoneNumber(normalizedPhone);
      setPendingPhone("");
      setPhoneSetupOtp("");
      setPhoneInput(toMalaysiaLocalPhone(normalizedPhone));
      setProfileMessage(t.phoneSetupOtpSent);
    } catch (error: any) {
      setProfileMessage(toFriendlyMessage(error, t.savePhoneFailed));
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneSetup = async () => {
    if (!pendingPhone) {
      setProfileMessage(t.enterPhoneNumberFirst);
      return;
    }

    if (!phoneSetupOtp.trim()) {
      setProfileMessage(t.enterOtpFirst);
      return;
    }

    setIsSavingPhoneNumber(true);
    setProfileMessage("");

    try {
      await verifyPhoneOtp(pendingPhone, phoneSetupOtp.trim(), "phone_change");
      setProfileMessage(t.phoneUpdated);
      setPendingPhone("");
      setPhoneSetupOtp("");
    } catch (error: any) {
      setProfileMessage(toFriendlyMessage(error, t.savePhoneFailed));
    } finally {
      setIsSavingPhoneNumber(false);
    }
  };

  const handleSecurePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      setProfileMessage(t.passwordTooShort);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setProfileMessage(t.passwordsDoNotMatch);
      return;
    }

    if (!otpCode.trim()) {
      setProfileMessage(t.enterOtpFirst);
      return;
    }

    if (!accountPhone) {
      setProfileMessage(t.noVerifiedPhone);
      return;
    }

    setIsUpdatingPassword(true);
    setProfileMessage("");

    try {
      await verifyPhoneOtp(accountPhone, otpCode.trim());
      await updatePassword(newPassword);
      setProfileMessage(t.passwordUpdated);
      resetPasswordForm();
      setPasswordMethod("none");
    } catch (error: any) {
      setProfileMessage(toFriendlyMessage(error, t.updatePasswordFailed));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {isProfileOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
          <button
            type="button"
            aria-label="Close profile"
            onClick={() => setIsProfileOpen(false)}
            className="absolute inset-0 bg-slate-900/35"
          />

          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between gap-3 bg-slate-50 border-b border-gray-200 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <CircleUserRound className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{t.profile}</h2>
                  <p className="text-xs text-gray-500">{t.profileSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">{t.accountDetails}</p>
                  <p className="text-sm font-semibold text-gray-900 break-all mt-1">{accountIdentifier}</p>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>{user?.email || (isGuest ? t.guestAccount : t.noEmailLinked)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>{accountPhone || t.noPhoneLinked}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>{isGuest ? t.guestUser : isAdmin ? t.administrator : t.standardUser}</span>
                  </div>
                </div>

                <div className={`rounded-xl border px-3 py-2 text-xs ${isGuest ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
                  {isGuest ? t.guestLocalOnlyNote : t.registeredSyncNote}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsPhoneSectionOpen((prev) => !prev)}
                  aria-expanded={isPhoneSectionOpen}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left bg-white"
                >
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-900">{t.phoneSetupTitle}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{accountPhone || t.noPhoneLinked}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPhoneSectionOpen ? "rotate-180" : ""}`} />
                </button>

                {isPhoneSectionOpen ? (
                  <div className="border-t border-gray-200 p-4 bg-slate-50">
                    <p className="text-sm text-gray-600 leading-relaxed">{t.phoneSetupHelp}</p>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneNumberLabel}</label>
                      <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden bg-white">
                        <span className="bg-gray-50 border-r border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600">+60</span>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(event) => setPhoneInput(toMalaysiaLocalPhone(event.target.value).slice(0, 11))}
                          placeholder={t.phonePlaceholderLocal}
                          className="w-full px-3 py-2.5 outline-none"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{t.malaysiaPhoneHint}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendPhoneSetupOtp}
                      disabled={isSendingPhoneOtp}
                      className="mt-3 w-full rounded-xl border border-blue-200 text-blue-700 py-2.5 text-sm font-semibold disabled:opacity-60 bg-white"
                    >
                      {isSendingPhoneOtp ? t.sendingOtp : t.sendPhoneOtp}
                    </button>

                    {pendingPhone ? (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneOtp}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={phoneSetupOtp}
                            onChange={(event) => setPhoneSetupOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder={t.enterOtp}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 tracking-[0.3em] bg-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleVerifyPhoneSetup}
                          disabled={isSavingPhoneNumber}
                          className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
                        >
                          {isSavingPhoneNumber ? t.verifying : t.verifySavePhone}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsPasswordSectionOpen((prev) => !prev)}
                  aria-expanded={isPasswordSectionOpen}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left bg-white"
                >
                  <div className="flex items-start gap-2">
                    <KeyRound className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-900">{t.securePasswordChange}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{t.securePasswordHelp}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPasswordSectionOpen ? "rotate-180" : ""}`} />
                </button>

                {isPasswordSectionOpen ? (
                  <div className="border-t border-gray-200 p-4 bg-slate-50">
                    <button
                      type="button"
                      onClick={handleEmailPasswordReset}
                      disabled={isSendingVerification || !user?.email}
                      className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      {t.sendToEmail}
                    </button>

                    {passwordMethod === "email" ? (
                      <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                        {t.emailResetHint}
                      </div>
                    ) : null}

                    {passwordMethod === "phone" ? (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneOtp}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={otpCode}
                            onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder={t.enterOtp}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 tracking-[0.3em] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.newPassword}</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(event) => setNewPassword(event.target.value)}
                              placeholder={t.newPassword}
                              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-11 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmNewPassword}</label>
                          <div className="relative">
                            <input
                              type={showConfirmNewPassword ? "text" : "password"}
                              value={confirmNewPassword}
                              onChange={(event) => setConfirmNewPassword(event.target.value)}
                              placeholder={t.confirmNewPassword}
                              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-11 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                              {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSecurePasswordUpdate}
                          disabled={isUpdatingPassword}
                          className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
                        >
                          {isUpdatingPassword ? t.verifying : t.verifySavePassword}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {profileMessage ? <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{profileMessage}</p> : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-xl border border-red-200 text-red-600 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logout}
                </button>

                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/app/admin");
                    }}
                    className="flex-1 rounded-xl border border-slate-200 text-slate-700 py-2.5 text-sm font-semibold"
                  >
                    {t.adminDashboard}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <HeartPulse className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MyAfiyah</h1>
              <p className="text-sm text-blue-100">{t.yourHealthCompanion}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setProfileMessage("");
                setIsProfileOpen(true);
              }}
              className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition"
              aria-label="Open profile"
            >
              <CircleUserRound className="w-6 h-6 text-white" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>
          </div>
        </div>
        <p className="text-lg mt-4">{greeting}!</p>
        <p className="text-blue-100 text-sm">{t.readyToLearn}</p>
      </div>

      <div className="px-6 -mt-4 mb-6 space-y-3">
        <button
          type="button"
          onClick={toggleLanguage}
          className="w-full bg-white rounded-2xl border border-blue-100 p-3 shadow-sm flex items-center justify-center gap-2 text-sm font-semibold text-blue-700"
        >
          <Globe2 className="w-4 h-4" />
          {language === "en" ? t.languageBahasa : t.languageEnglish}
        </button>

        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t.loggedInAs}</p>
              <p className="text-sm font-semibold text-gray-900 break-all">{accountIdentifier}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="text-sm font-semibold text-blue-700"
            >
              {t.viewProfile}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-blue-700 font-medium">{t.toolsCompleted}</p>
              <p className="text-blue-900 text-lg font-bold">{completedCounts.tool}</p>
            </div>
            <div className="bg-green-50 rounded-lg px-3 py-2">
              <p className="text-green-700 font-medium">{t.guidesCompleted}</p>
              <p className="text-green-900 text-lg font-bold">{completedCounts.guide}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 mb-6">
        <button
          onClick={() => navigate("/app/emergency")}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Phone className="w-6 h-6" />
          <span className="text-lg font-bold">{t.emergencyHelp}</span>
        </button>
      </div>

      <div className="px-6 mb-6">
        <div className="relative h-48 rounded-2xl overflow-hidden shadow-md">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1643227991784-fabfe0cf4470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwaW5nJTIwcGVvcGxlJTIwZmlyc3QlMjBhaWQlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NzMzOTk2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt={t.firstAidTrainingAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
            <div className="text-white">
              <p className="text-sm font-medium">{t.learnEssentialSkills}</p>
              <h3 className="text-xl font-bold">{t.bePreparedSaveLives}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t.quickAccess}</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickAccessCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`${card.color} p-5 rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all text-left`}
              >
                <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 ${card.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{card.title}</h3>
                <p className="text-xs text-gray-600 leading-tight">{card.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-2xl border border-green-100">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-green-600" />
            {t.didYouKnow}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{t.didYouKnowText}</p>
        </div>
      </div>
    </div>
  );
}
