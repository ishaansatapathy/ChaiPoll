import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SocialButtons from './SocialButtons';

const AuthCard = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signup({ name: formData.name, email: formData.email, password: formData.password });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[360px] mx-auto bg-[#0c0c0c] border border-white/[0.04] rounded-[1.5rem] p-8 shadow-2xl">
      <div className="flex items-start justify-between mb-8">
        <h2 className="text-[32px] font-bold text-white tracking-tight leading-[1.1]">
          {isLogin ? (
            <>Welcome<br />back.</>
          ) : (
            <>Create<br />account.</>
          )}
        </h2>
        
        <div className="flex bg-[#1a1a1a] rounded-[1.2rem] p-1 border border-white/[0.04] mt-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex flex-col items-center justify-center w-12 h-10 rounded-[1rem] transition-all ${
              isLogin ? 'bg-[#2a2a2a] text-white shadow-md' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">Sign</span>
            <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">In</span>
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex flex-col items-center justify-center w-12 h-10 rounded-[1rem] transition-all ${
              !isLogin ? 'bg-[#2a2a2a] text-white shadow-md' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">Sign</span>
            <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">Up</span>
          </button>
        </div>
      </div>

      <SocialButtons />

      <div className="my-8" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-5 overflow-hidden"
            >
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="name@company.com"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          required
        />

        {!isLogin && (
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
          />
        )}

        {error && (
          <p className="text-[11px] text-red-500/80 px-1 italic">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-[#d4d4d8] py-3.5 text-sm font-bold text-black transition-all hover:bg-white active:scale-[0.98] mt-2"
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, name, type, value, onChange, placeholder, required }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-[14px] border border-white/[0.04] bg-[#141414] px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/10 focus:bg-[#1f2029] transition-all"
    />
  </div>
);

export default AuthCard;
