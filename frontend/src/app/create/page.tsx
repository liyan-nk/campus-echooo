"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, BarChart2, Plus, Trash, EyeOff, Sparkles } from "lucide-react";

export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState("FEED");
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length <= 2) return;
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = val;
    setPollOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);

    const postData: any = {
      title,
      content,
      anonymous,
      category,
    };

    if (showPoll && pollQuestion.trim()) {
      postData.poll = {
        question: pollQuestion,
        options: pollOptions.filter((opt) => opt.trim() !== ""),
        expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      };
    }

    try {
      await api.post("/posts", postData);
      router.push("/");
    } catch (err: any) {
      alert("Failed to create post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStaff = user && ["SUPER_ADMIN", "FACULTY", "UNIV_ADMIN", "DEPT_ADMIN"].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>

      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Create a New Post
        </h1>
        <p className="text-xs text-text-secondary mt-1">Start a discussion, ask a question, or launch a campus poll.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Post Category
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategory("FEED")}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  category === "FEED"
                    ? "bg-brand-primary/10 border-brand-primary text-white"
                    : "border-dark-border bg-dark-bg text-text-secondary hover:text-white"
                }`}
              >
                Campus Feed
              </button>
              
              {isStaff && (
                <button
                  type="button"
                  onClick={() => setCategory("ANNOUNCEMENT")}
                  className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    category === "ANNOUNCEMENT"
                      ? "bg-brand-primary/10 border-brand-primary text-white"
                      : "border-dark-border bg-dark-bg text-text-secondary hover:text-white"
                  }`}
                >
                  Official Announcement
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your discussion a clear topic..."
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Body Content
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share or discuss?"
              rows={5}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-xs text-white placeholder-text-muted focus:border-brand-primary focus:outline-none resize-none"
            />
          </div>

          {/* Anonymous checkbox */}
          <div className="flex items-center justify-between p-4 bg-dark-surface/60 border border-dark-border rounded-xl">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-xs font-semibold text-white">Post Anonymously</p>
                <p className="text-[10px] text-text-muted mt-0.5">Your real profile name won't be shown to other students.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded border-dark-border bg-dark-bg text-brand-primary focus:ring-0 w-5 h-5 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Poll Section Toggle */}
        <div className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-primary" />
              <div>
                <p className="text-xs font-semibold text-white">Create a Campus Poll</p>
                <p className="text-[10px] text-text-muted mt-0.5">Let students cast votes anonymously on choices.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="px-3 py-1.5 border border-dark-border text-xs font-semibold rounded-lg text-text-secondary hover:text-white"
            >
              {showPoll ? "Remove Poll" : "Add Poll"}
            </button>
          </div>

          {showPoll && (
            <div className="pt-4 border-t border-dark-border/40 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Poll Question
                </label>
                <input
                  type="text"
                  required={showPoll}
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Which date works best for the next study session?"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white placeholder-text-muted focus:border-brand-primary focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Poll Options
                </label>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required={showPoll && idx < 2}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-xs text-white placeholder-text-muted focus:border-brand-primary focus:outline-none transition-all"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1.5 px-3 py-2 border border-dark-border text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Option
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publish Post
            </>
          )}
        </button>
      </form>
    </div>
  );
}
