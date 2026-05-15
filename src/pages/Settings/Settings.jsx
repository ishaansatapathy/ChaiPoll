import React from "react";
import { motion } from "framer-motion";
import { RoughNotation } from "react-rough-notation";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Highlight } from "../../components/ui/Highlight";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <section className="py-8 relative min-h-screen">
      <div className="mb-12 border-b border-white/5 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mb-3">
            Account
          </p>
          <h1 className="font-display text-5xl font-normal tracking-tight text-white md:text-6xl">
            <Highlight>Settings</Highlight>
          </h1>
        </motion.div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr]">
        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="surface rounded-3xl p-8 border border-white/5 bg-white/[0.02] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserIcon size={120} />
            </div>
            <div className="flex flex-wrap items-center gap-8 relative z-10">
              <div className="relative group">
                <div className="absolute -inset-1 border border-[#ef4444]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                {user?.avatar && !user.avatar.includes("default-avatar.png") && !imgError ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="relative size-24 rounded-3xl object-cover border border-white/10"
                    onError={() => setImgError(true)}
                  />
                ) : null}
                <div
                  className={`relative size-24 rounded-3xl bg-white/5 items-center justify-center border border-white/10 ${(!user?.avatar || user.avatar.includes("default-avatar.png") || imgError) ? "flex" : "hidden"}`}
                >
                  <UserIcon size={40} className="text-white/20" />
                </div>
              </div>
              <div className="space-y-4 flex-1 min-w-[200px]">
                <div className="relative inline-block">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Display Name
                  </p>
                  <RoughNotation
                    type="underline"
                    show={true}
                    color="#ef4444"
                    strokeWidth={3}
                    padding={2}
                    iterations={2}
                  >
                    <p className="text-2xl text-white font-medium">
                      {user?.displayName || user?.name || "User"}
                    </p>
                  </RoughNotation>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Email Address
                  </p>
                  <p className="text-lg text-white/60">{user?.email || "No email linked"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">
                    Account Created
                  </p>
                  <p className="text-sm text-white/40">Member since joining ChaiPoll</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Logout */}
        <div className="relative">
          <div className="sticky top-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="surface rounded-3xl p-10 border border-[#ef4444]/20 bg-[#ef4444]/[0.02] relative overflow-hidden text-center"
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 p-4 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20">
                  <LogOut className="text-[#ef4444]" size={32} />
                </div>
                <h3 className="font-display text-3xl text-white mb-2 leading-tight">Sign Out</h3>
                <div className="my-8 relative px-6">
                  <RoughNotation
                    type="underline"
                    show={true}
                    color="#ef4444"
                    strokeWidth={1}
                    padding={2}
                  >
                    <span className="font-handwriting text-2xl text-white/70 block transform -rotate-2">
                      "See you next time!"
                    </span>
                  </RoughNotation>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full h-14 rounded-2xl bg-[#ef4444] text-white font-bold text-sm tracking-widest hover:bg-[#ff5555] transition-all shadow-xl"
                >
                  SIGN OUT
                </button>
              </div>
            </motion.div>
            <div className="px-6">
              <span className="font-handwriting text-[#ef4444] text-xl block">
                Every logout saves a cup of chai. ☕
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
