import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import RecoveryFlow from "./RecoveryFlow";

import { RoughNotation } from "react-rough-notation";

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOGIN": return { ...state, isLogin: action.payload, isRecovery: false };
    case "SET_RECOVERY": return { ...state, isRecovery: action.payload };
    case "SET_FORM": return { ...state, formData: { ...state.formData, ...action.payload }, error: "", showErrorNotation: false };
    case "SET_ERROR": return { ...state, error: action.payload, loading: false };
    case "SET_ERROR_NOTATION": return { ...state, showErrorNotation: action.payload };
    case "SET_LOADING": return { ...state, loading: action.payload };
    case "SET_2FA": return { ...state, is2FA: action.payload, loading: false, error: "" };
    default: return state;
  }
};

const AuthCard = ({ initialSignup = false }) => {
  const [state, dispatch] = React.useReducer(authReducer, {
    isLogin: !initialSignup,
    isRecovery: false,
    formData: { name: "", email: "", password: "", confirmPassword: "" },
    error: "",
    showErrorNotation: false,
    loading: false,
    is2FA: false,
    otp: ""
  });

  const { isLogin, isRecovery, formData, error, showErrorNotation, loading, is2FA } = state;
  const { login, signup, verify2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isRecovery) {
    return (
      <div className="relative w-full max-w-[360px] mx-auto bg-[#0c0c0c] border border-white/[0.04] rounded-[1.5rem] p-8 shadow-2xl overflow-visible min-h-[500px]">
        <RecoveryFlow onBack={() => dispatch({ type: "SET_RECOVERY", payload: false })} />
      </div>
    );
  }

  const handleInputChange = (e) => {
    dispatch({ type: "SET_FORM", payload: { [e.target.name]: e.target.value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      if (is2FA) {
        await verify2FA(formData.email, state.otp);
      } else if (isLogin) {
        const res = await login({ email: formData.email, password: formData.password });
        if (res.twoFactorRequired) {
          dispatch({ type: "SET_2FA", payload: true });
          return;
        }
      } else {
        if (formData.password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await signup({ name: formData.name, email: formData.email, password: formData.password });
      }
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      dispatch({ type: "SET_ERROR", payload: msg });
      if (
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("compromised")
      ) {
        setTimeout(() => dispatch({ type: "SET_ERROR_NOTATION", payload: true }), 100);
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div className="relative w-full max-w-[310px] mx-auto bg-[#0c0c0c] border border-white/[0.04] rounded-[1.8rem] p-7 shadow-2xl overflow-visible">
      <div className="flex items-start justify-between mb-8">
        <h2 className="text-[32px] font-semibold text-white tracking-tight leading-[1.1]">
          {isLogin ? (
            <>
              Welcome
              <br />
              back.
            </>
          ) : (
            <>
              Create
              <br />
              account.
            </>
          )}
        </h2>

        <div className="flex bg-[#1a1a1a] rounded-[1.2rem] p-1 border border-white/[0.04] mt-1">
          {!is2FA && (
            <>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_LOGIN", payload: true })}
                className={`flex flex-col items-center justify-center w-12 h-10 rounded-[1rem] transition-all ${
                  isLogin ? "bg-[#2a2a2a] text-white shadow-md" : "text-white/40 hover:text-white/60"
                }`}
              >
                <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">
                  Sign
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">In</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_LOGIN", payload: false })}
                className={`flex flex-col items-center justify-center w-12 h-10 rounded-[1rem] transition-all ${
                  !isLogin ? "bg-[#2a2a2a] text-white shadow-md" : "text-white/40 hover:text-white/60"
                }`}
              >
                <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">
                  Sign
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">Up</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!is2FA && <SocialButtons returnTo={location.state?.from?.pathname} />}

      <div className="my-8" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {is2FA ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <Input
                label="2FA Code"
                name="otp"
                type="text"
                value={state.otp}
                onChange={(e) => dispatch({ type: "SET_FORM", payload: { otp: e.target.value } })}
                placeholder="000000"
                required
              />
              <p className="text-[10px] text-white/40 text-center uppercase tracking-widest">
                Enter the 6-digit code sent to your email.
              </p>
            </motion.div>
          ) : (
            !isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
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
            )
          )}
        </AnimatePresence>

        {!is2FA && (
          <>
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
          </>
        )}

        {isLogin && !is2FA && (
          <div className="flex justify-end -mt-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_RECOVERY", payload: true })}
              className="text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-[#ef4444] transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}

        {!isLogin && !is2FA && (
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

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-2"
            >
              <RoughNotation
                type="underline"
                show={showErrorNotation}
                color="#ef4444"
                strokeWidth={2}
                padding={2}
              >
                <p className="text-[11px] text-red-500 font-bold uppercase tracking-widest italic flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                  {error.includes("already exists") ? "Account already exists." : error}
                </p>
              </RoughNotation>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-[#d4d4d8] py-3.5 text-sm font-bold text-black transition-all hover:bg-white active:scale-[0.98] mt-2"
        >
          {loading ? "Processing..." : is2FA ? "Verify Code" : isLogin ? "Sign In" : "Sign Up"}
        </button>

        {is2FA && (
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_2FA", payload: false })}
            className="w-full text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold hover:text-white transition-colors mt-2"
          >
            Back to Login
          </button>
        )}
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
