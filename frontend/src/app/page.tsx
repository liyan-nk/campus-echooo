"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Send, 
  Check, 
  Clock, 
  EyeOff, 
  UserCheck, 
  Sparkles, 
  ChevronRight, 
  Plus
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: string;
  title: string;
  content: string;
  anonymous: boolean;
  author: {
    name?: string;
    alias?: string;
    avatarUrl?: string;
    role?: string;
  };
  category: string;
  postType: string;
  mediaUrls: string[];
  createdAt: string;
  poll?: {
    id: string;
    question: string;
    expiresAt: string;
    options: Array<{
      id: string;
      text: string;
      _count?: { votes: number };
    }>;
  };
  score: number;
  commentCount: number;
  rawVotes: Array<{ userId: string; type: "UPVOTE" | "DOWNVOTE" }>;
}

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState("new");
  const [feedCategory, setFeedCategory] = useState("FEED");

  const algorithms = [
    { id: "new", label: "Newest" },
    { id: "hot", label: "Hot 🔥" },
    { id: "trending", label: "Trending 🚀" },
    { id: "top", label: "Top Rated" },
  ];

  const fetchFeed = async (alg = algorithm, cat = feedCategory) => {
    setLoading(true);
    try {
      const data = await api.get<Post[]>(`/posts/feed?algorithm=${alg}&category=${cat}`);
      setPosts(data);
    } catch (e) {
      console.error("Failed to load feed:", e);
      // Generate some beautiful local fallback mock data for testing
      setPosts(getMockPosts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchFeed();
    }
  }, [user, authLoading]);

  const handleVote = async (postId: string, type: "UPVOTE" | "DOWNVOTE") => {
    if (!user) return;
    try {
      await api.post(`/posts/${postId}/vote`, { type });
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id !== postId) return post;
          const existingVoteIndex = post.rawVotes.findIndex(v => v.userId === user.id);
          let newRawVotes = [...post.rawVotes];
          let scoreDiff = 0;

          if (existingVoteIndex > -1) {
            const prevVote = post.rawVotes[existingVoteIndex];
            if (prevVote.type === type) {
              newRawVotes.splice(existingVoteIndex, 1);
              scoreDiff = type === "UPVOTE" ? -1 : 1;
            } else {
              newRawVotes[existingVoteIndex] = { userId: user.id, type };
              scoreDiff = type === "UPVOTE" ? 2 : -2;
            }
          } else {
            newRawVotes.push({ userId: user.id, type });
            scoreDiff = type === "UPVOTE" ? 1 : -1;
          }

          return {
            ...post,
            score: post.score + scoreDiff,
            rawVotes: newRawVotes,
          };
        })
      );
    } catch (e) {
      console.error("Voting failed:", e);
    }
  };

  const handlePollVote = async (postId: string, optionId: string) => {
    if (!user) return;
    try {
      await api.post(`/posts/poll/vote/${optionId}`, {});
      // Refresh feed to show updated percentage
      fetchFeed();
    } catch (e) {
      alert("Voting failed: " + (e as Error).message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 glass-panel border border-dark-border rounded-2xl max-w-md mx-auto mt-12 p-8">
        <Sparkles className="w-12 h-12 text-brand-primary mx-auto mb-4 animate-pulse" />
        <h2 className="text-lg font-bold text-white mb-2">Connect to Campus</h2>
        <p className="text-xs text-text-secondary mb-6">You must sign in to see the active campus feed and vote.</p>
        <Link href="/login" className="inline-block px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-semibold text-xs rounded-xl transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Campus Feed <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">Active</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">What's happening at Echo State right now.</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-primary/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </Link>
      </div>

      {/* Category Selector */}
      <div className="flex border-b border-dark-border gap-4 pb-px">
        <button
          onClick={() => {
            setFeedCategory("FEED");
            fetchFeed(algorithm, "FEED");
          }}
          className={`px-2 py-2.5 text-xs font-semibold transition-all relative border-b-2 whitespace-nowrap cursor-pointer ${
            feedCategory === "FEED" 
              ? "border-brand-primary text-white" 
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          Student Discussion
        </button>
        <button
          onClick={() => {
            setFeedCategory("ANNOUNCEMENT");
            fetchFeed(algorithm, "ANNOUNCEMENT");
          }}
          className={`px-2 py-2.5 text-xs font-semibold transition-all relative border-b-2 whitespace-nowrap cursor-pointer ${
            feedCategory === "ANNOUNCEMENT" 
              ? "border-brand-primary text-white" 
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          Official Announcements 📢
        </button>
      </div>

      {/* Sorting Tabs */}
      <div className="flex border-b border-dark-border/40 gap-2 overflow-x-auto pb-px">
        {algorithms.map((alg) => (
          <button
            key={alg.id}
            onClick={() => {
              setAlgorithm(alg.id);
              fetchFeed(alg.id, feedCategory);
            }}
            className={`px-4 py-2.5 text-xs font-semibold transition-all relative border-b-2 whitespace-nowrap cursor-pointer ${
              algorithm === alg.id 
                ? "border-brand-primary text-white" 
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            {alg.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel border border-dark-border/50 rounded-2xl p-6 space-y-4 shimmer h-40" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 glass-panel border border-dark-border rounded-2xl">
          <p className="text-sm text-text-secondary">No posts found in this feed category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => {
              const myVote = post.rawVotes.find(v => v.userId === user?.id)?.type;
              const hasPoll = !!post.poll;
              
              // Calculate poll total votes
              const totalPollVotes = post.poll?.options.reduce((acc, opt) => acc + (opt._count?.votes || 0), 0) || 0;

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={post.id}
                  className="glass-panel border border-dark-border p-6 rounded-2xl hover:border-dark-border/80 transition-colors"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                        post.anonymous 
                          ? "bg-dark-hover border border-dark-border text-text-secondary" 
                          : "bg-brand-primary/10 border border-brand-primary/20 text-brand-primary"
                      }`}>
                        {post.author.alias?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {post.author.alias || "Anonymous Student"}
                          </span>
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-text-muted px-1.5 py-0.5 rounded bg-dark-hover border border-dark-border uppercase tracking-wider">
                            <EyeOff className="w-2.5 h-2.5" />
                            Anonymous
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-3 pl-1">
                    <h2 className="text-sm font-bold text-white tracking-tight">{post.title}</h2>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    {/* Media attachments */}
                    {post.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 rounded-xl overflow-hidden my-2 max-h-60 border border-dark-border">
                        {post.mediaUrls.map((url, idx) => (
                          <img key={idx} src={url} alt="Attachment" className="object-cover w-full h-full" />
                        ))}
                      </div>
                    )}

                    {/* Poll Card */}
                    {hasPoll && post.poll && (
                      <div className="mt-4 p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
                        <p className="text-xs font-semibold text-white">{post.poll.question}</p>
                        <div className="space-y-2">
                          {post.poll.options.map((option) => {
                            const optionVotes = option._count?.votes || 0;
                            const percentage = totalPollVotes > 0 ? Math.round((optionVotes / totalPollVotes) * 100) : 0;

                            return (
                              <button
                                key={option.id}
                                onClick={() => handlePollVote(post.id, option.id)}
                                className="w-full relative py-2.5 px-4 text-left rounded-lg bg-dark-bg border border-dark-border hover:border-brand-primary/40 text-xs text-white transition-all overflow-hidden flex justify-between items-center group cursor-pointer"
                              >
                                {/* Background progress bar */}
                                <div 
                                  className="absolute top-0 bottom-0 left-0 bg-brand-primary/10 transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                                <span className="font-medium relative z-10">{option.text}</span>
                                <span className="text-text-secondary relative z-10 font-bold">{percentage}%</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-text-muted">{totalPollVotes} votes total</p>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-dark-border/40 pl-1">
                    {/* Voting */}
                    <div className="flex items-center bg-dark-surface rounded-xl border border-dark-border px-1">
                      <button
                        onClick={() => handleVote(post.id, "UPVOTE")}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          myVote === "UPVOTE" ? "text-brand-primary bg-brand-primary/10" : "text-text-secondary hover:text-white"
                        }`}
                      >
                        <ArrowBigUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold px-1 text-white min-w-4 text-center">
                        {post.score}
                      </span>
                      <button
                        onClick={() => handleVote(post.id, "DOWNVOTE")}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          myVote === "DOWNVOTE" ? "text-danger bg-danger/10" : "text-text-secondary hover:text-white"
                        }`}
                      >
                        <ArrowBigDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comments trigger */}
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-dark-surface hover:bg-dark-hover rounded-xl border border-dark-border text-xs text-text-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentCount}</span>
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Fallback Mock Data Generator
function getMockPosts(): Post[] {
  return [
    {
      id: "mock-1",
      title: "Should CS grading curves be standard across all departments?",
      content: "Currently CS 101 has a much stricter grading distribution than CS 102. It feels highly unfair for batch of 2027 classes.",
      anonymous: true,
      author: { alias: "SneakyProfessor" },
      category: "FEED",
      postType: "POLL",
      mediaUrls: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      poll: {
        id: "poll-1",
        question: "Is the current CS grading fair?",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        options: [
          { id: "opt-1", text: "Yes, standard is good", _count: { votes: 12 } },
          { id: "opt-2", text: "No, professors should customize", _count: { votes: 45 } },
          { id: "opt-3", text: "Keep as is", _count: { votes: 3 } }
        ]
      },
      score: 34,
      commentCount: 8,
      rawVotes: []
    },
    {
      id: "mock-2",
      title: "Lost my iPad at the Student Union today",
      content: "It's a grey iPad Air with a black folio cover. It has a sticker of a blue rocket on the back. If found, please drop it at the CS reception desk or reply here. Thank you so much!",
      anonymous: false,
      author: { name: "Sarah Connor", role: "STUDENT" },
      category: "FEED",
      postType: "TEXT",
      mediaUrls: [],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      score: 18,
      commentCount: 2,
      rawVotes: []
    }
  ];
}
