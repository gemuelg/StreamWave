// src/lib/actions/comments.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// New type to include like/dislike counts
export type CommentWithStats = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  parent_comment_id: number | null;
  profiles: {
    username: string | null;
  } | null;
  likes_count: number;
  dislikes_count: number;
};

// --- Comment Fetching (now with a more reliable method) ---
export async function getComments(mediaId: number, mediaType: 'movie' | 'tv'): Promise<{ data: CommentWithStats[] | null, error: string | null }> {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // Step 1: Fetch comments first
    const { data: commentsData, error: commentsError } = await supabase
      .from('media_comments')
      .select(`id, content, created_at, user_id, parent_comment_id`)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError.message);
      return { data: null, error: commentsError.message };
    }

    // Step 2: Get all unique user IDs from the fetched comments
    const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

    // Step 3: Fetch the profiles for those specific users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError.message);
      return { data: null, error: profilesError.message };
    }

    // Step 4: Fetch the like/dislike counts
    const { data: votesData, error: votesError } = await supabase
      .from('comment_votes')
      .select('comment_id, vote_type');
    
    if (votesError) {
        console.error('Error fetching votes:', votesError.message);
        return { data: null, error: votesError.message };
    }

    const votesMap = new Map();
    votesData.forEach(vote => {
        const key = vote.comment_id;
        if (!votesMap.has(key)) {
            votesMap.set(key, { likes: 0, dislikes: 0 });
        }
        if (vote.vote_type === 'like') {
            votesMap.get(key).likes++;
        } else {
            votesMap.get(key).dislikes++;
        }
    });

    // Step 5: Combine all the data
    const profileMap = new Map(profilesData.map(p => [p.id, p]));
    const combinedData: CommentWithStats[] = commentsData.map(comment => {
      const profile = profileMap.get(comment.user_id);
      const votes = votesMap.get(comment.id) || { likes: 0, dislikes: 0 };
      
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        parent_comment_id: comment.parent_comment_id,
        profiles: profile ? { username: profile.username } : null,
        likes_count: votes.likes,
        dislikes_count: votes.dislikes,
      };
    });
    
    return { data: combinedData, error: null };
  } catch (error) {
    console.error('Unexpected error fetching comments:', error);
    return { data: null, error: 'An unexpected error occurred.' };
  }
}

// --- Comment Creation ---
export async function addComment(mediaId: number, mediaType: 'movie' | 'tv', content: string, parentCommentId: number | null = null) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'User is not authenticated.' };
  }
  
  try {
    const { data, error } = await supabase
      .from('media_comments')
      .insert({
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        content: content,
        parent_comment_id: parentCommentId,
      })
      .select();

    if (error) {
      console.error('Error adding comment:', error.message);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error adding comment:', error);
    return { data: null, error: 'An unexpected error occurred.' };
  }
}

// --- Vote Management ---
export async function voteOnComment(commentId: number, voteType: 'like' | 'dislike') {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'User is not authenticated.' };
  }

  try {
    const { data: existingVote, error: fetchError } = await supabase
      .from('comment_votes')
      .select('id, vote_type')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(fetchError.message);
    }

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('id', existingVote.id);
        if (deleteError) throw new Error(deleteError.message);
      } else {
        const { error: updateError } = await supabase
          .from('comment_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
        if (updateError) throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await supabase
        .from('comment_votes')
        .insert({
          user_id: user.id,
          comment_id: commentId,
          vote_type: voteType,
        });
      if (insertError) throw new Error(insertError.message);
    }

    return { data: 'Vote successful', error: null };

  } catch (error) {
    console.error('Error voting on comment:', error);
    return { data: null, error: 'An unexpected error occurred.' };
  }
}