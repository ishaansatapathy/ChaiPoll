import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, KeyRound, ArrowLeft, Send, Zap } from 'lucide-react';
import { RoughNotation } from 'react-rough-notation';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RecoveryFlow = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Choice, 3: Verification (OTP), 4: New Password
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState(''); // 'otp' or 'link'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendRecovery = async (recoveryMethod) => {
    setMethod(recoveryMethod);
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email, method: recoveryMethod });
      if (recoveryMethod === 'link') {
        setMessage('Identity verification link sent to your signal.');
        setStep(5); // Success state
      } else {
        setStep(3); // OTP state
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signal lost. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      // Logic will be implemented in backend
      await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      setStep(4);
    } catch (err) {
      setError('Invalid code sequence.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
      setMessage('Identity restored. You can now authenticate.');
      setTimeout(() => onBack(), 3000);
    } catch (err) {
      setError('System rejection. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={12} /> Abort Recovery
      </button>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-2">Identify <br />Account.</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-8">Enter your registered signal</p>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Email Signal</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@nexus.com"
                      className="w-full rounded-[14px] border border-white/[0.04] bg-[#141414] pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#ef4444]/40 transition-all"
                    />
                  </div>
               </div>
               <button
                disabled={!email || loading}
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-white py-3.5 text-xs font-black text-black uppercase tracking-widest hover:bg-[#ef4444] hover:text-white transition-all"
               >
                 Initialize Scan
               </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Recovery <br />Protocols.</h2>
            
            <div className="grid gap-4">
               <button 
                onClick={() => handleSendRecovery('otp')}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#ef4444]/40 hover:bg-[#ef4444]/5 transition-all group"
               >
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover:text-[#ef4444]">
                       <Zap size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white">6-Digit Code</p>
                       <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Instant via Email</p>
                    </div>
                  </div>
                  <Send size={14} className="text-white/10 group-hover:text-white" />
               </button>

               <button 
                onClick={() => handleSendRecovery('link')}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group"
               >
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover:text-white">
                       <KeyRound size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white">Magic Link</p>
                       <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Direct Secure Redirect</p>
                    </div>
                  </div>
                  <Send size={14} className="text-white/10 group-hover:text-white" />
               </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-2">Verify <br />Signal.</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-8">Enter the 6-digit code sent to signal</p>
            
            <div className="space-y-6">
               <div className="space-y-2 text-center">
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    placeholder="000000"
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-center text-5xl font-display tracking-[0.4em] text-white focus:outline-none focus:border-[#ef4444] transition-all"
                  />
               </div>
               <button
                disabled={otp.length !== 6 || loading}
                onClick={handleVerifyOTP}
                className="w-full rounded-xl bg-white py-3.5 text-xs font-black text-black uppercase tracking-widest hover:bg-[#ef4444] hover:text-white transition-all"
               >
                 Authorize Decode
               </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-2">Restructure <br />Identity.</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-8">Define your new access sequence</p>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[14px] border border-white/[0.04] bg-[#141414] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ef4444]/40 transition-all"
                  />
               </div>
               <button
                disabled={newPassword.length < 6 || loading}
                onClick={handleResetPassword}
                className="w-full rounded-xl bg-white py-3.5 text-xs font-black text-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
               >
                 Confirm Restore
               </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex flex-col items-center py-10 text-center">
               <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <ShieldCheck className="text-emerald-500" size={32} />
               </div>
               <p className="text-lg font-bold text-white mb-2">Protocol Successful</p>
               <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                 {message}
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[9px] text-red-500 font-bold uppercase tracking-widest text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default RecoveryFlow;
