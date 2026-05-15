import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import heroImage from "../../../bg-image/hero-bg.png";
import RoughChaiCodeMark from "../../components/auth/RoughChaiCodeMark";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] font-sans">
      {/* Background Layers matching Auth.jsx */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.85] mix-blend-lighten">
        <img src={heroImage} alt="" className="h-full w-full object-cover grayscale contrast-[1.2] brightness-[0.25]" />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(190,190,190,0.14),rgba(0,0,0,0)_42%)]" />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-6">
        <div className="absolute top-[10%] left-[8%] hidden md:block">
          <RoughChaiCodeMark />
        </div>

        <div className="w-full max-w-[340px] bg-[#0c0c0c] border border-white/[0.04] rounded-[1.8rem] p-8 shadow-2xl">
          <h2 className="text-[32px] font-bold text-white tracking-tight leading-[1.1] mb-8">
            Reset<br />password.
          </h2>

          {success ? (
            <div className="space-y-4">
              <p className="text-green-500 text-sm font-bold uppercase tracking-widest">Success!</p>
              <p className="text-white/60 text-xs">Your password has been updated. Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-[14px] border border-white/[0.04] bg-[#141414] px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/10 focus:bg-[#1f2029] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-[14px] border border-white/[0.04] bg-[#141414] px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/10 focus:bg-[#1f2029] transition-all"
                />
              </div>

              {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest italic">{error}</p>}

              <button
                disabled={loading}
                className="w-full rounded-xl bg-[#d4d4d8] py-3.5 text-sm font-bold text-black transition-all hover:bg-white active:scale-[0.98] mt-2"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
