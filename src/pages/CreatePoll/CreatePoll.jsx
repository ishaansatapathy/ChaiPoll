import React, { useState, useCallback } from "react";
import { Plus, X, Loader2, Globe, Clock, Shield, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Highlight } from "../../components/ui/Highlight.jsx";
import { createPoll } from "../../services/api.js";

// Helper to generate unique IDs without relying on external state counters
const genId = () => Math.random().toString(36).substring(2, 9);

export default function CreatePoll() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pollData, setPollData] = useState({
    title: "",
    description: "",
    visibility: "public",
    expiresAt: "",
    settings: { anonymous: false },
  });

  const [questions, setQuestions] = useState([
    { id: genId(), text: "", options: ["", ""], isMandatory: true, correctOptionIndex: null, type: "single" },
  ]);

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        id: genId(),
        text: "",
        options: ["", ""],
        isMandatory: true,
        correctOptionIndex: null,
        type: "single",
      },
    ]);
  }, []);

  const removeQuestion = useCallback(
    (id) => {
      if (questions.length <= 1) return;
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    },
    [questions.length]
  );

  const updateQuestion = useCallback((id, updates) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!pollData.title.trim()) {
        throw new Error("Poll title is required");
      }

      const sanitizedQuestions = questions.map((q) => ({
        ...q,
        options: q.options.filter((o) => o.trim()),
      }));

      for (const q of sanitizedQuestions) {
        if (!q.text.trim()) throw new Error("All questions must have text");
        if (q.options.length < 2) throw new Error("Each question needs at least 2 options");
      }

      await createPoll({ ...pollData, questions: sanitizedQuestions });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-8 relative">
      <div className="mb-12 border-b border-white/5 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-[1px] w-8 bg-[#ef4444]" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
              New Poll
            </p>
          </div>
          <h1 className="font-display text-5xl font-normal tracking-[-0.05em] text-white md:text-7xl leading-tight">
            Create <br />
            <span className="text-white/40 italic">
              <Highlight>Poll</Highlight>
            </span>
          </h1>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12">
          {/* Header Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="surface rounded-[40px] p-8 border border-white/5 bg-white/[0.01]">
              <div className="grid gap-8">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-3 block">
                    Poll Title
                  </label>
                  <input
                    type="text"
                    placeholder="What's this poll about?"
                    className="w-full bg-transparent border-b border-white/10 py-3 text-3xl font-display text-white placeholder-white/10 transition-all focus:border-[#ef4444] focus:outline-none"
                    value={pollData.title}
                    onChange={(e) => setPollData({ ...pollData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-3 block">
                    Description
                  </label>
                  <textarea
                    placeholder="Context for participants..."
                    className="w-full bg-white/[0.02] rounded-2xl border border-white/5 p-5 text-sm text-white placeholder-white/10 transition-all focus:border-white/20 focus:outline-none min-h-[80px] resize-none"
                    value={pollData.description}
                    onChange={(e) => setPollData({ ...pollData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Question List */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="font-display text-2xl text-white">
                Questions <span className="text-white/20">({questions.length})</span>
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ef4444] text-white text-[10px] font-bold tracking-widest hover:bg-[#ff5555] transition-all"
              >
                <Plus size={14} /> ADD QUESTION
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {questions.map((q, idx) => (
                <QuestionEditor
                  key={q.id}
                  index={idx}
                  question={q}
                  canRemove={questions.length > 1}
                  onUpdate={(updates) => updateQuestion(q.id, updates)}
                  onRemove={() => removeQuestion(q.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="relative">
          <div className="sticky top-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="surface rounded-[40px] p-6 border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-3xl overflow-hidden relative"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ef4444]/5 blur-[100px] pointer-events-none" />
              <h2 className="font-display text-xl text-white mb-8 flex items-center gap-3">
                Settings
                <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white/40 font-bold tracking-widest uppercase">
                  Poll
                </span>
              </h2>

              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#ef4444]">
                    <Globe size={12} strokeWidth={3} />
                    <label className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60">
                      Visibility
                    </label>
                  </div>
                  <select
                    value={pollData.visibility}
                    onChange={(e) => setPollData({ ...pollData, visibility: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-[12px] text-white focus:border-[#ef4444] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="public" className="bg-[#0a0a0a]">
                      Public
                    </option>
                    <option value="unlisted" className="bg-[#0a0a0a]">
                      Unlisted (Link Only)
                    </option>
                    <option value="private" className="bg-[#0a0a0a]">
                      Private
                    </option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock size={12} strokeWidth={3} />
                    <label className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60">
                      Deadline
                    </label>
                  </div>
                  <input
                    type="datetime-local"
                    value={pollData.expiresAt}
                    onChange={(e) => setPollData({ ...pollData, expiresAt: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-[12px] text-white focus:border-amber-400 focus:outline-none [color-scheme:dark]"
                  />
                </div>

                <div
                  onClick={() =>
                    setPollData({
                      ...pollData,
                      settings: { ...pollData.settings, anonymous: !pollData.settings.anonymous },
                    })
                  }
                  className="group relative flex items-center justify-between p-4 rounded-[24px] bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/20 transition-all duration-500 overflow-hidden"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className={`p-2 rounded-xl transition-all duration-500 ${pollData.settings.anonymous ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 text-white/20"}`}
                    >
                      <Shield size={14} />
                    </div>
                    <div>
                      <p
                        className={`text-[12px] font-bold tracking-tight transition-colors ${pollData.settings.anonymous ? "text-white" : "text-white/40"}`}
                      >
                        Anonymous Voting
                      </p>
                      <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest">
                        No login required
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-6 w-11 rounded-full p-0.5 transition-all duration-500 flex items-center ${pollData.settings.anonymous ? "bg-emerald-500" : "bg-white/10"}`}
                  >
                    <motion.div
                      animate={{ x: pollData.settings.anonymous ? 20 : 0 }}
                      className="h-5 w-5 rounded-full bg-white"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-8 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[9px] text-red-400 font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="mt-10 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ef4444] to-[#ff6b6b] rounded-[24px] blur opacity-10 group-hover:opacity-30 transition duration-1000" />
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-16 rounded-[24px] bg-white text-black font-black text-[10px] tracking-[0.3em] hover:bg-[#ef4444] hover:text-white transition-all duration-500 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "CREATE POLL"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </section>
  );
}

function QuestionEditor({ index, question, onUpdate, onRemove, canRemove }) {
  const handleOptionChange = (optIdx, val) => {
    const newOptions = [...question.options];
    newOptions[optIdx] = val;
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    onUpdate({ options: [...question.options, ""] });
  };

  const removeOption = (optIdx) => {
    if (question.options.length <= 2) return;
    const newOptions = question.options.filter((_, i) => i !== optIdx);
    let newCorrectIndex = question.correctOptionIndex;
    if (newCorrectIndex === optIdx) newCorrectIndex = null;
    else if (newCorrectIndex > optIdx) newCorrectIndex -= 1;
    onUpdate({ options: newOptions, correctOptionIndex: newCorrectIndex });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="surface rounded-[40px] p-8 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative group"
    >
      <div className="absolute -left-4 top-10">
        <span className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#ef4444] backdrop-blur-xl">
          {index + 1}
        </span>
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-8 right-8 p-2 text-white/10 hover:text-[#ef4444] transition-colors"
        >
          <X size={20} />
        </button>
      )}

      <div className="flex gap-2 mb-8">
        {["single", "multiple"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onUpdate({ type })}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              question.type === type 
                ? "bg-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                : "bg-white/5 text-white/20 hover:bg-white/10"
            }`}
          >
            {type} Choice
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-3 block">
            Question Text
          </label>
          <input
            type="text"
            placeholder="What are you asking?"
            className="w-full bg-transparent border-b border-white/10 py-2 text-xl font-display text-white placeholder-white/10 transition-all focus:border-[#ef4444] focus:outline-none"
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">
            Options
          </label>
          {question.options.map((opt, oIdx) => (
            <div key={oIdx} className="relative flex items-center gap-3 group/opt">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                placeholder={`Option ${oIdx + 1}`}
                className={`w-full rounded-xl border px-5 py-3 text-sm text-white placeholder-white/10 transition-all focus:outline-none ${
                  question.correctOptionIndex === oIdx
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-white/[0.03] border-white/5 focus:border-[#ef4444]"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => onUpdate({ correctOptionIndex: oIdx })}
                className={`p-2 transition-all ${
                  question.correctOptionIndex === oIdx
                    ? "text-emerald-500 opacity-100"
                    : "text-white/10 hover:text-emerald-500/50 opacity-0 group-hover/opt:opacity-100"
                }`}
                title="Mark as Correct"
              >
                <CheckCircle2 size={18} />
              </button>
              {question.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(oIdx)}
                  className="p-2 text-white/10 hover:text-[#ef4444] transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="mt-2 flex w-fit items-center gap-2 text-[10px] font-bold text-white/30 hover:text-[#ef4444] transition-all"
          >
            <Plus size={12} /> ADD OPTION
          </button>
        </div>

        <div className="flex items-center border-t border-white/5 pt-6">
          <div
            onClick={() => onUpdate({ isMandatory: !question.isMandatory })}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div
              className={`h-4 w-4 rounded-md border transition-all flex items-center justify-center ${
                question.isMandatory ? "bg-[#ef4444] border-[#ef4444]" : "border-white/10"
              }`}
            >
              {question.isMandatory && <X size={12} className="text-white" />}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                question.isMandatory ? "text-white" : "text-white/20"
              }`}
            >
              Required
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
