'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { getComments, addComment, voteOnComment, type CommentWithStats } from '@/lib/actions/comments';

interface CommentSectionProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

interface CommentFormProps {
  onPost: (content: string, parentCommentId: number | null) => void;
  isPosting: boolean;
  user: any;
  parentCommentId: number | null;
  onCancelReply?: () => void;
}

type CommentNode = CommentWithStats & {
  replies: CommentNode[];
};

const formatTimestamp = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
};

const groupCommentsByParent = (comments: CommentWithStats[]): CommentNode[] => {
  const commentMap: { [key: number]: CommentNode } = {};
  const rootComments: CommentNode[] = [];

  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  comments.forEach(comment => {
    if (comment.parent_comment_id) {
      const parent = commentMap[comment.parent_comment_id];
      if (parent) {
        parent.replies.push(commentMap[comment.id]);
      }
    } else {
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
};

const CommentForm: React.FC<CommentFormProps> = ({ onPost, isPosting, user, parentCommentId, onCancelReply }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() === '') return;
    onPost(content, parentCommentId);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-full">
      <div className="flex items-start space-x-3">
        <div className="w-9 h-9 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-zinc-200 font-bold text-sm flex-shrink-0 shadow-inner">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentCommentId ? 'Write a professional reply...' : 'Join the discussion...'}
          className="flex-1 w-full p-3 text-sm rounded-xl bg-white/[0.02] text-zinc-100 border border-white/5 placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-blue-500/30 resize-none transition-all duration-200"
          rows={parentCommentId ? 2 : 3}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        {parentCommentId && (
          <button
            type="button"
            onClick={onCancelReply}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPosting}
          className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
            isPosting
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/10'
          }`}
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ mediaId, mediaType }) => {
  const user = useUser();
  const [comments, setComments] = useState<CommentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await getComments(mediaId, mediaType);
    if (error) {
      setError(error);
    } else if (data) {
      setComments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [mediaId, mediaType]);

  const handlePostComment = async (content: string, parentCommentId: number | null) => {
    if (!user) {
      setError('Authentication token expired or missing. Please log in.');
      return;
    }

    setIsPosting(true);
    const { data, error } = await addComment(mediaId, mediaType, content, parentCommentId);
    
    if (error) {
      setError(error);
    } else if (data) {
      setError(null);
      fetchComments();
      setReplyingTo(null);
    }
    setIsPosting(false);
  };

  const handleVote = async (commentId: number, voteType: 'like' | 'dislike') => {
    if (!user) {
      setError('You must be authenticated to perform this interaction.');
      return;
    }
    await voteOnComment(commentId, voteType);
    fetchComments();
  };

  const renderComment = (comment: CommentNode) => (
    <div key={comment.id} className="flex flex-col space-y-2">
      <div className="flex items-start space-x-3">
        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 text-sm font-bold flex-shrink-0">
          {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-zinc-200 font-semibold text-sm tracking-tight truncate">
              {comment.profiles?.username || 'Anonymous User'}
            </span>
            <span className="text-zinc-500 text-xs">
              • {formatTimestamp(comment.created_at)}
            </span>
          </div>
          <p className="text-zinc-300 text-sm mt-1 leading-relaxed break-words whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center space-x-4 text-zinc-500 text-xs mt-2">
            <button
              onClick={() => handleVote(comment.id, 'like')}
              className="flex items-center space-x-1 hover:text-zinc-200 transition-colors group"
            >
              <svg className="w-3.5 h-3.5 stroke-current fill-none group-hover:text-blue-400" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218M19.5 10.25a2.25 2.25 0 00-2.25-2.25h-5.25l.63-3.03A2.25 2.25 0 009.225 2.5H6.633a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 006.633 17.5h2.626a2.25 2.25 0 002.135-1.582l1.151-3.664a2.25 2.25 0 00-2.135-2.918H6.633z" />
              </svg>
              <span>{comment.likes_count}</span>
            </button>
            
            <button
              onClick={() => handleVote(comment.id, 'dislike')}
              className="flex items-center space-x-1 hover:text-zinc-200 transition-colors group"
            >
              <svg className="w-3.5 h-3.5 stroke-current fill-none group-hover:text-red-400" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.367 13.75c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672v.672a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218M4.5 13.75a2.25 2.25 0 002.25 2.25h5.25l-.63 3.03A2.25 2.25 0 0014.775 21.5h2.592a2.25 2.25 0 002.25-2.25V8.75a2.25 2.25 0 00-2.25-2.25h-2.626a2.25 2.25 0 00-2.135 1.582l-1.151 3.664a2.25 2.25 0 002.135 2.918h3.334z" />
              </svg>
              <span>{comment.dislikes_count}</span>
            </button>

            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="hover:text-zinc-200 transition-colors font-medium"
            >
              Reply
            </button>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 border-l-2 border-white/5 pl-4 py-1">
              <CommentForm
                onPost={handlePostComment}
                isPosting={isPosting}
                user={user}
                parentCommentId={comment.id}
                onCancelReply={() => setReplyingTo(null)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l border-white/5 pl-6 ml-4 mt-2 space-y-4">
          {comment.replies.map(renderComment)}
        </div>
      )}
    </div>
  );

  const rootComments = groupCommentsByParent(comments);

  return (
    <div className="w-full bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
        <h2 className="text-sm font-semibold tracking-wider text-blue-400 uppercase">
          Discussion ({comments.length})
        </h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        {user ? (
          <CommentForm
            onPost={handlePostComment}
            isPosting={isPosting}
            user={user}
            parentCommentId={null}
          />
        ) : (
          <div className="space-y-3 w-full">
            <div className="flex items-center space-x-3 text-xs text-zinc-400">
              <div className="w-9 h-9 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                You must be <Link href="/auth" prefetch={false} className="text-blue-400 hover:underline font-semibold">logged in</Link> to post a comment.
              </div>
            </div>
            <textarea
              disabled
              placeholder="Authentication required to input text data..."
              className="w-full p-3 text-sm rounded-xl bg-white/[0.01] text-zinc-600 border border-white/5 resize-none cursor-not-allowed opacity-50"
              rows={3}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-6 text-xs text-zinc-500 tracking-wide animate-pulse">
            Syncing discussions database...
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 tracking-wide">
            No submissions recorded yet. Start the conversation.
          </div>
        ) : (
          <div className="space-y-6 border-t border-white/5 pt-6">
            {rootComments.map(renderComment)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;