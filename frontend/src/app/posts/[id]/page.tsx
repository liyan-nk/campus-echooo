"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  EyeOff, 
  UserCheck, 
  Clock, 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  Pin,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Comment {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  author: {
    name: string;
    avatarUrl?: string;
    role?: string;
    isAnonymous: boolean;
  };
  replies: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      // Fetch feed matching this post
      const feed = await api.get<any[]>(`/posts/feed`);
      const foundPost = feed.find((p) => p.id === postId);
      setPost(foundPost || getMockPost(postId));

      const commentData = await api.get<Comment[]>(`/posts/${postId}/comments`);
      setComments(commentData);
    } catch (e) {
      console.error("Failed to load post details:", e);
      setPost(getMockPost(postId));
      setComments(getMockComments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostAndComments();
    }
  }, [postId]);

  const handleCreateComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    const isAnon = parentId ? replyAnonymous : anonymous;

    if (!content.trim()) return;

    try {
      await api.post(`/posts/${postId}/comments`, {
        content,
        anonymous: isAnon,
        parentId,
      });

      // Clear fields
      if (parentId) {
        setReplyContent("");
        setReplyToId(null);
      } else {
        setNewComment("");
      }

      // Reload comments
      const commentData = await api.get<Comment[]>(`/posts/${postId}/comments`);
      setComments(commentData);
    } catch (err: any) {
      alert("Failed to comment: " + err.message);
    }
  };

  const handlePinComment = async (commentId: string) => {
    try {
      await api.post(`/posts/comments/${commentId}/pin`, {});
      alert("Comment pinned successfully!");
      // Reload comments
      const commentData = await api.get<Comment[]>(`/posts/${postId}/comments`);
      setComments(commentData);
    } catch (err: any) {
      alert(err.message || "Failed to pin comment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12 glass-panel border border-dark-border rounded-2xl">
        <p className="text-sm text-text-secondary">Post not found.</p>
        <button onClick={() => router.back()} className="text-brand-primary text-xs font-semibold mt-4">
          Go Back
        </button>
      </div>
    );
  }

  // Recursive Comment Node Renderer
  const renderCommentNode = (comment: Comment, depth = 0) => {
    const isAuthorStaff = ["SUPER_ADMIN", "FACULTY", "UNIV_ADMIN"].includes(user?.role || "");

    return (
      <div key={comment.id} className="space-y-4">
        <div className={`p-4 rounded-xl border border-dark-border bg-dark-bg transition-colors relative ${
          comment.pinned ? "border-brand-primary/40 bg-brand-primary/5" : ""
        }`}>
          {comment.pinned && (
            <div className="absolute right-4 top-4 flex items-center gap-1 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
              <Pin className="w-3.5 h-3.5 fill-brand-primary" /> Pinned
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-[10px] font-bold uppercase text-brand-primary">
              {comment.author.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{comment.author.name}</span>
                {comment.author.isAnonymous ? (
                  <span className="text-[8px] font-bold text-text-muted px-1 py-0.2 bg-dark-hover border border-dark-border rounded uppercase">
                    Anon
                  </span>
                ) : (
                  <span className="text-[8px] font-bold text-brand-accent px-1 py-0.2 bg-brand-primary/10 border border-brand-primary/20 rounded uppercase">
                    {comment.author.role}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-text-muted mt-0.5">{new Date(comment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed pl-1">{comment.content}</p>

          <div className="flex items-center gap-3 mt-4 text-[10px] font-semibold text-text-muted pl-1">
            <button
              onClick={() => {
                setReplyToId(comment.id);
                setReplyContent("");
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Reply
            </button>
            {isAuthorStaff && !comment.pinned && (
              <button
                onClick={() => handlePinComment(comment.id)}
                className="hover:text-brand-primary transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <Pin className="w-2.5 h-2.5" /> Pin Comment
              </button>
            )}
          </div>
        </div>

        {/* Reply Box Inline */}
        {replyToId === comment.id && (
          <div className="pl-6 flex gap-3">
            <CornerDownRight className="w-4 h-4 text-text-muted shrink-0 mt-2" />
            <form onSubmit={(e) => handleCreateComment(e, comment.id)} className="flex-1 glass-panel border border-dark-border p-4 rounded-xl space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-xs text-white placeholder-text-muted focus:border-brand-primary focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replyAnonymous}
                    onChange={(e) => setReplyAnonymous(e.target.checked)}
                    className="rounded border-dark-border bg-dark-bg text-brand-primary focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Reply anonymously</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyToId(null)}
                    className="px-3 py-1.5 border border-dark-border text-text-secondary hover:text-white text-[10px] font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                  >
                    <Send className="w-2.5 h-2.5" /> Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-6 border-l border-dark-border space-y-4 ml-3">
            {comment.replies.map((reply) => renderCommentNode(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </button>

      {/* Main Post Card */}
      <div className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
            post.anonymous ? "bg-dark-hover border border-dark-border text-text-secondary" : "bg-brand-primary/10 border border-brand-primary/20 text-brand-primary"
          }`}>
            {post.anonymous ? "A" : post.author.name?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                {post.anonymous ? post.author.alias : post.author.name}
              </span>
              {post.anonymous ? (
                <span className="text-[8px] font-bold text-text-muted px-1.5 py-0.5 rounded bg-dark-hover border border-dark-border uppercase">Anon</span>
              ) : (
                <span className="text-[8px] font-bold text-brand-accent px-1.5 py-0.5 rounded bg-brand-primary/5 border border-brand-primary/10 uppercase">Verified ({post.author.role})</span>
              )}
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-base font-bold text-white tracking-tight">{post.title}</h1>
          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {/* Write a comment */}
      <div className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Leave a Comment</h3>
        <form onSubmit={(e) => handleCreateComment(e, null)} className="space-y-3">
          <textarea
            required
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-white placeholder-text-muted focus:border-brand-primary focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded border-dark-border bg-dark-bg text-brand-primary focus:ring-0 w-4 h-4"
              />
              <span>Comment anonymously</span>
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Post Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-brand-primary" />
          Comments Thread ({comments.length})
        </h3>
        
        <div className="space-y-4">
          {comments.map((comment) => renderCommentNode(comment))}
        </div>
      </div>
    </div>
  );
}

// Local mock templates
function getMockPost(id: string) {
  return {
    id,
    title: "Should CS grading curves be standard across all departments?",
    content: "Currently CS 101 has a much stricter grading distribution than CS 102. It feels highly unfair for batch of 2027 classes.",
    anonymous: true,
    author: { alias: "SneakyProfessor" },
    createdAt: new Date().toISOString(),
  };
}

function getMockComments(): Comment[] {
  return [
    {
      id: "comment-1",
      content: "Agreed. CS-101 curves down heavily to maintain a C average, which makes no sense for introductory batches.",
      pinned: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      author: { name: "QuantumStudent12", isAnonymous: true },
      replies: [
        {
          id: "comment-1-reply",
          content: "Exactly! I spent 20 hours a week on assignments just to end up with a B- because of the curve.",
          pinned: false,
          createdAt: new Date(Date.now() - 900000).toISOString(),
          author: { name: "Sarah Connor", role: "STUDENT", isAnonymous: false },
          replies: []
        }
      ]
    },
    {
      id: "comment-2",
      content: "As a faculty member, the curve is defined by the academic council to maintain batting indices. We will raise this in the next department board.",
      pinned: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      author: { name: "Dr. Jane Smith", role: "FACULTY", isAnonymous: false },
      replies: []
    }
  ];
}
