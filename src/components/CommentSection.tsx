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

// New type that includes the nested 'replies' property
type CommentNode = CommentWithStats & {
  replies: CommentNode[];
};

// Helper to format timestamps
const formatTimestamp = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    return `${diffInDays} days ago`;
  }
};

// New helper function to organize comments into a tree structure
const groupCommentsByParent = (comments: CommentWithStats[]): CommentNode[] => {
  const commentMap: { [key: number]: CommentNode } = {};
  const rootComments: CommentNode[] = [];

  // Create a map and initialize replies array
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Organize comments into the tree
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

// A sub-component for the comment form to handle replies
const CommentForm: React.FC<CommentFormProps> = ({ onPost, isPosting, user, parentCommentId, onCancelReply }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim() === '') return;
    onPost(content, parentCommentId);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 font-semibold text-lg flex-shrink-0">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentCommentId ? 'Write a reply...' : 'Leave a comment...'}
          className="flex-1 w-full p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accentBlue resize-none"
          rows={parentCommentId ? 2 : 3}
          required
        />
      </div>
      <div className="flex justify-end space-x-4">
        {parentCommentId && (
          <button
            type="button"
            onClick={onCancelReply}
            className="px-6 py-2 rounded-lg font-bold text-gray-400 hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPosting}
          className={`px-6 py-2 rounded-lg font-bold transition-colors duration-200 ${
            isPosting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-accentBlue hover:bg-pink-600 text-white'
          }`}
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

// Main Comment Section Component
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
      setError('You must be logged in to post a comment.');
      return;
    }

    setIsPosting(true);
    const { data, error } = await addComment(mediaId, mediaType, content, parentCommentId);
    
    if (error) {
      setError(error);
    } else if (data) {
      setError(null);
      fetchComments(); // Re-fetch all comments to get the new one
      setReplyingTo(null); // Close reply form
    }
    setIsPosting(false);
  };

  const handleVote = async (commentId: number, voteType: 'like' | 'dislike') => {
    if (!user) {
      setError('You must be logged in to vote.');
      return;
    }
    await voteOnComment(commentId, voteType);
    fetchComments(); // Re-fetch comments to update vote counts
  };

  // Sub-component to render an individual comment
  const renderComment = (comment: CommentNode) => (
    <div key={comment.id} className="flex flex-col">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
          {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 font-bold">{comment.profiles?.username || 'Anonymous'}</span>
            <span className="text-gray-500 text-xs">
              · {formatTimestamp(comment.created_at)}
            </span>
          </div>
          <p className="text-gray-200 mt-1">{comment.content}</p>

          <div className="flex items-center space-x-4 text-gray-400 text-sm mt-2">
            {/* Like Button */}
            <button
              onClick={() => handleVote(comment.id, 'like')}
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <span className="w-4 h-4">👍</span>
              <span>{comment.likes_count}</span>
            </button>
            {/* Dislike Button */}
            <button
              onClick={() => handleVote(comment.id, 'dislike')}
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <span className="w-4 h-4">👎</span>
              <span>{comment.dislikes_count}</span>
            </button>
            {/* Reply Button */}
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <span>Reply</span>
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-4">
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

      {/* Render Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-14 pt-4 space-y-6">
          {comment.replies.map(renderComment)}
        </div>
      )}
    </div>
  );
  
  const rootComments = groupCommentsByParent(comments);

  return (
    <div className="mt-8 p-6 bg-darkOverlay rounded-lg shadow-xl border border-gray-700">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{comments.length} Comments</h2>
      </div>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      {/* Main Comment Input Section */}
      {user ? (
        <CommentForm
          onPost={handlePostComment}
          isPosting={isPosting}
          user={user}
          parentCommentId={null}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 text-sm flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1 text-gray-400">
              You must be <Link href="/login" className="text-accentBlue hover:underline">login</Link> to post a comment.
            </div>
          </div>
          <div className="relative">
            <textarea
              disabled
              placeholder="Leave a comment"
              className="w-full p-4 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 resize-none cursor-not-allowed"
              rows={3}
            />
            <div className="absolute right-4 bottom-4 text-xl text-gray-500">
              😊
            </div>
          </div>
        </div>
      )}
      
      {/* Comments List */}
      {!loading && rootComments.length === 0 && (
        <p className="text-gray-400 text-center mt-6">No comments yet. Be the first to leave one!</p>
      )}

      {loading && <p className="text-gray-400 text-center mt-6">Loading comments...</p>}
      
      {!loading && rootComments.length > 0 && (
        <div className="space-y-6 mt-6">
          {rootComments.map(renderComment)}
        </div>
      )}
    </div>
  );
};

export default CommentSection;