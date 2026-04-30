import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, HeartPulse, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useAppLanguage } from "../lib/language";

export function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [language] = useAppLanguage();
  const t = language === "ms"
    ? {
        title: "Tetapkan Semula Kata Laluan",
        subtitle: "Tetapkan kata laluan baharu anda selepas pengesahan",
        banner: "Halaman ini digunakan selepas langkah tetapan semula kata laluan yang selamat melalui e-mel atau OTP.",
        passwordTooShort: "Kata laluan mesti sekurang-kurangnya 6 aksara.",
        passwordMismatch: "Kata laluan tidak sepadan.",
        updated: "Kata laluan dikemas kini. Mengubah hala ke log masuk...",
        updateFailed: "Tidak dapat mengemas kini kata laluan.",
        newPassword: "Kata laluan baharu",
        confirmPassword: "Sahkan kata laluan baharu",
        hidePassword: "Sembunyikan kata laluan",
        showPassword: "Tunjukkan kata laluan",
        updating: "Mengemas kini...",
        save: "Simpan Kata Laluan Baharu",
        back: "Kembali ke log masuk",
      }
    : {
        title: "Reset Password",
        subtitle: "Set your new password after verification",
        banner: "This page is used after a secure email or OTP password reset step.",
        passwordTooShort: "Password must be at least 6 characters.",
        passwordMismatch: "Passwords do not match.",
        updated: "Password updated. Redirecting to login...",
        updateFailed: "Unable to update password.",
        newPassword: "New password",
        confirmPassword: "Confirm new password",
        hidePassword: "Hide password",
        showPassword: "Show password",
        updating: "Updating...",
        save: "Save New Password",
        back: "Back to login",
      };
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage(t.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setMessage(t.updated);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error: any) {
      setMessage(error.message ?? t.updateFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-700 to-blue-800 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t.banner}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.newPassword}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.newPassword}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmPassword}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {message ? <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? t.updating : t.save}
          </button>
        </form>

        <Link to="/login" className="block text-center mt-4 text-sm text-blue-700 font-medium">
          {t.back}
        </Link>
      </div>
    </div>
  );
}
