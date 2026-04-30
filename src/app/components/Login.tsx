import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { Eye, EyeOff, HeartPulse, Languages, PhoneCall, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useAppLanguage } from "../lib/language";

type Language = "en" | "ms";
type AuthMethod = "email" | "guest";

const copy = {
  en: {
    secureSignIn: "Secure sign in",
    emergencyHelp: "Emergency Help",
    languageTip: "Tip: You can switch between English and Bahasa Melayu here anytime.",
    emailTab: "Email",
    guestTab: "Guest",
    phoneTab: "Phone Number",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    phoneLabel: "Phone number",
    otpLabel: "Verification code",
    phonePlaceholder: "0123456789",
    otpPlaceholder: "Enter the 6-digit code",
    phoneHint: "We will send an OTP to confirm you own this number. New verified numbers can create an account automatically if SMS auth is enabled.",
    phoneLocalHint: "Malaysia only — enter your number without the country code. `+60123456789` and `0123456789` are treated the same.",
    createSuccess: "Account created. Check your email for verification if required, then log in.",
    authFailed: "Authentication failed.",
    passwordTooShort: "Password must be at least 6 characters.",
    passwordMismatch: "Passwords do not match.",
    resetPrompt: "Enter your email first, then tap Forgot Password.",
    resetSent: "Password reset email sent. Check your inbox.",
    resetFailed: "Unable to send reset email.",
    googleFailed: "Unable to continue with Google.",
    googleConfigError: "Google sign-in could not start. Check the Supabase Google provider, redirect URLs, and Google Cloud OAuth client settings.",
    googleDisabledNote: "Enable Google login by setting `VITE_ENABLE_GOOGLE_AUTH=true` after the Google provider credentials are connected in Supabase.",
    phonePrompt: "Enter your phone number first.",
    otpPrompt: "Enter the verification code sent to your phone.",
    phoneCodeSent: "Verification code sent. Enter the 6-digit OTP to continue.",
    phoneSendFailed: "Unable to send the verification code.",
    phoneVerifyFailed: "Unable to verify the code.",
    phoneProviderHint: "Phone login requires SMS auth to be enabled in Supabase with a provider like Twilio.",
    guestTitle: "Continue as Guest",
    guestHint: "Guest data stays on this device only. If the app is uninstalled or browser/app data is cleared, the guest profile, saved progress, and emergency contacts are lost.",
    guestCompare: "Use an email account if you want to log in on other devices and keep your saved data synced.",
    guestButton: "Continue as Guest",
    submitLogin: "Login",
    submitCreate: "Create Account",
    submitWait: "Please wait...",
    sendCode: "Send verification code",
    verifyCode: "Verify & continue",
    resendCode: "Resend code",
    googleButton: "Continue with Google",
    forgotPassword: "Forgot Password",
    sendingReset: "Sending reset email...",
    toggleToLogin: "Already have an account? Login",
    toggleToCreate: "No account yet? Create one",
  },
  ms: {
    secureSignIn: "Log masuk selamat",
    emergencyHelp: "Bantuan Kecemasan",
    languageTip: "Tip: Anda boleh tukar antara English dan Bahasa Melayu di sini pada bila-bila masa.",
    emailTab: "E-mel",
    guestTab: "Tetamu",
    phoneTab: "Nombor Telefon",
    emailLabel: "E-mel",
    passwordLabel: "Kata laluan",
    confirmPasswordLabel: "Sahkan kata laluan",
    phoneLabel: "Nombor telefon",
    otpLabel: "Kod pengesahan",
    phonePlaceholder: "0123456789",
    otpPlaceholder: "Masukkan kod 6 digit",
    phoneHint: "Kami akan menghantar OTP untuk mengesahkan nombor ini milik anda. Nombor baharu yang disahkan juga boleh mencipta akaun secara automatik jika SMS auth diaktifkan.",
    phoneLocalHint: "Malaysia sahaja — masukkan nombor tanpa kod negara. `+60123456789` dan `0123456789` akan dianggap sama.",
    createSuccess: "Akaun berjaya dicipta. Semak e-mel anda untuk pengesahan jika diperlukan, kemudian log masuk.",
    authFailed: "Pengesahan gagal.",
    passwordTooShort: "Kata laluan mesti sekurang-kurangnya 6 aksara.",
    passwordMismatch: "Kata laluan tidak sepadan.",
    resetPrompt: "Masukkan e-mel anda dahulu, kemudian tekan Lupa Kata Laluan.",
    resetSent: "E-mel tetapan semula kata laluan telah dihantar. Sila semak peti masuk anda.",
    resetFailed: "Tidak dapat menghantar e-mel tetapan semula.",
    googleFailed: "Tidak dapat meneruskan dengan Google.",
    googleConfigError: "Log masuk Google tidak dapat dimulakan. Semak provider Google di Supabase, URL redirect, dan tetapan klien OAuth Google Cloud.",
    googleDisabledNote: "Aktifkan log masuk Google dengan menetapkan `VITE_ENABLE_GOOGLE_AUTH=true` selepas kelayakan provider Google disambungkan dalam Supabase.",
    phonePrompt: "Masukkan nombor telefon anda dahulu.",
    otpPrompt: "Masukkan kod pengesahan yang dihantar ke telefon anda.",
    phoneCodeSent: "Kod pengesahan telah dihantar. Masukkan OTP 6 digit untuk meneruskan.",
    phoneSendFailed: "Tidak dapat menghantar kod pengesahan.",
    phoneVerifyFailed: "Tidak dapat mengesahkan kod tersebut.",
    phoneProviderHint: "Log masuk telefon memerlukan SMS auth diaktifkan dalam Supabase bersama penyedia seperti Twilio.",
    guestTitle: "Teruskan sebagai Tetamu",
    guestHint: "Data tetamu hanya disimpan pada peranti ini. Jika aplikasi dipadam atau data pelayar/aplikasi dibersihkan, profil tetamu, kemajuan tersimpan, dan nombor kecemasan akan hilang.",
    guestCompare: "Gunakan akaun e-mel jika anda mahu log masuk pada peranti lain dan mengekalkan data tersimpan anda.",
    guestButton: "Teruskan sebagai Tetamu",
    submitLogin: "Log Masuk",
    submitCreate: "Cipta Akaun",
    submitWait: "Sila tunggu...",
    sendCode: "Hantar kod pengesahan",
    verifyCode: "Sahkan & teruskan",
    resendCode: "Hantar semula kod",
    googleButton: "Teruskan dengan Google",
    forgotPassword: "Lupa Kata Laluan",
    sendingReset: "Menghantar e-mel tetapan semula...",
    toggleToLogin: "Sudah ada akaun? Log masuk",
    toggleToCreate: "Belum ada akaun? Cipta satu",
  },
} as const;

const LANGUAGE_TIP_KEY = "myafiyah:login-language-tip-seen";
const googleAuthEnabled = ((import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_ENABLE_GOOGLE_AUTH ?? "").toLowerCase() === "true";

export function Login() {
  const navigate = useNavigate();
  const { user, signIn, signInWithGoogle, signInAsGuest, signUp, requestPasswordReset } = useAuth();
  const [language, setLanguage] = useAppLanguage();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLanguageTip, setShowLanguageTip] = useState(() => !localStorage.getItem(LANGUAGE_TIP_KEY));

  const t = copy[language];

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const rawError =
      searchParams.get("error_description") ??
      hashParams.get("error_description") ??
      searchParams.get("error") ??
      hashParams.get("error");

    if (rawError) {
      const decodedError = decodeURIComponent(rawError.replace(/\+/g, " "));
      setErrorMessage(/invalid_client/i.test(decodedError) ? t.googleConfigError : decodedError);
      setSuccessMessage("");
      setLoading(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handlePageRestore = () => setLoading(false);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setLoading(false);
      }
    };

    window.addEventListener("pageshow", handlePageRestore);
    window.addEventListener("focus", handlePageRestore);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageRestore);
      window.removeEventListener("focus", handlePageRestore);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [t.googleConfigError]);

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const dismissLanguageTip = () => {
    setShowLanguageTip(false);
    localStorage.setItem(LANGUAGE_TIP_KEY, "true");
  };

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    dismissLanguageTip();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (authMethod === "guest") {
        await signInAsGuest();
        return;
      }

      if (isCreatingAccount) {
        if (password.length < 6) {
          setErrorMessage(t.passwordTooShort);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage(t.passwordMismatch);
          return;
        }

        await signUp(email, password);
        setSuccessMessage(t.createSuccess);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      const message = error?.message ?? t.authFailed;
      if (/invalid_client/i.test(message)) {
        setErrorMessage(t.googleConfigError);
      } else {
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMessage(t.resetPrompt);
      return;
    }

    setIsResetting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await requestPasswordReset(email.trim());
      setSuccessMessage(t.resetSent);
    } catch (error: any) {
      setErrorMessage(error.message ?? t.resetFailed);
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await signInWithGoogle();
    } catch (error: any) {
      const message = error?.message ?? t.googleFailed;
      setErrorMessage(/invalid_client/i.test(message) ? t.googleConfigError : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-cyan-700 to-emerald-700 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MyAfiyah</h1>
              <p className="text-sm text-gray-500">{t.secureSignIn}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 p-1">
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                language === "en" ? "bg-white text-blue-700 shadow-sm" : "text-blue-700"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("ms")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                language === "ms" ? "bg-white text-blue-700 shadow-sm" : "text-blue-700"
              }`}
            >
              Bahasa Melayu
            </button>
          </div>
        </div>

        {showLanguageTip ? (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-start gap-3">
            <Languages className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p>{t.languageTip}</p>
            </div>
            <button
              type="button"
              onClick={dismissLanguageTip}
              className="text-blue-700 font-semibold"
            >
              ×
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => navigate("/emergency")}
          className="w-full mb-4 bg-red-50 border border-red-200 text-red-700 py-3 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
        >
          <PhoneCall className="w-4 h-4" />
          {t.emergencyHelp}
        </button>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setConfirmPassword("");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`rounded-xl py-2.5 text-sm font-semibold transition ${
              authMethod === "email" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {t.emailTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("guest");
              setIsCreatingAccount(false);
              setConfirmPassword("");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`rounded-xl py-2.5 text-sm font-semibold transition ${
              authMethod === "guest" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {t.guestTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMethod === "email" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.passwordLabel}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isCreatingAccount ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPasswordLabel}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      minLength={6}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <UserRound className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{t.guestTitle}</p>
                  <p className="mt-1">{t.guestHint}</p>
                  <p className="mt-2 text-amber-800">{t.guestCompare}</p>
                </div>
              </div>
            </div>
          )}

          {errorMessage ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{errorMessage}</p>
          ) : null}

          {successMessage ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">{successMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading
              ? t.submitWait
              : authMethod === "guest"
                ? t.guestButton
                : isCreatingAccount
                  ? t.submitCreate
                  : t.submitLogin}
          </button>

          {authMethod === "email" && !isCreatingAccount ? (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || !googleAuthEnabled}
                className="w-full border border-gray-300 bg-white text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t.googleButton}
              </button>
              {!googleAuthEnabled ? <p className="text-xs text-amber-700 text-center">{t.googleDisabledNote}</p> : null}
            </>
          ) : null}

          {authMethod === "email" && !isCreatingAccount ? (
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isResetting}
              className="w-full text-sm text-blue-700 font-medium"
            >
              {isResetting ? t.sendingReset : t.forgotPassword}
            </button>
          ) : null}
        </form>

        {authMethod === "email" ? (
          <button
            type="button"
            onClick={() => {
              setIsCreatingAccount((prev) => !prev);
              setConfirmPassword("");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="w-full mt-4 text-sm text-blue-700 font-medium"
          >
            {isCreatingAccount ? t.toggleToLogin : t.toggleToCreate}
          </button>
        ) : null}

        <p className="mt-6 text-center text-xs text-gray-500">Powered by Supabase</p>
      </div>
    </div>
  );
}
