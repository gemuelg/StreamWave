// src/lib/actions/media_stats.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// --- Helper function to create Supabase client ---
function getSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
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
}

// --- Increment Views Count ---
export async function incrementViews(mediaId: number, mediaType: 'movie' | 'tv') {
  const supabase = getSupabaseClient();
  
  try {
    const { data: existingView, error: fetchError } = await supabase
      .from('media_views')
      .select('views_count')
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching views:', fetchError.message);
      return { success: false, error: 'Failed to fetch views' };
    }

    if (existingView) {
      // If a row exists, increment the view count
      const { error: updateError } = await supabase
        .from('media_views')
        .update({ views_count: existingView.views_count + 1 })
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      if (updateError) {
        console.error('Error updating views:', updateError.message);
        return { success: false, error: updateError.message };
      }
    } else {
      // If no row exists, create one
      const { error: insertError } = await supabase
        .from('media_views')
        .insert({
          media_id: mediaId,
          media_type: mediaType,
          views_count: 1,
        });
      
      if (insertError) {
        console.error('Error inserting views:', insertError.message);
        return { success: false, error: insertError.message };
      }
    }
    
    return { success: true, error: null };
  } catch (e) {
    console.error('Unexpected error in incrementViews:', e);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// --- Handle User Ratings ---
export async function rateMedia(mediaId: number, mediaType: 'movie' | 'tv', rating: number) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User is not authenticated.' };
  }

  try {
    const { data, error } = await supabase
      .from('media_ratings')
      .upsert(
        {
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
          rating: rating,
        },
        { onConflict: 'user_id, media_id, media_type' }
      )
      .single();

    if (error) {
      console.error('Error rating media:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data, error: null };
  } catch (e) {
    console.error('Unexpected error in rateMedia:', e);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// --- Get Media Stats (Average Rating and View Count) ---
export async function getMediaStats(mediaId: number, mediaType: 'movie' | 'tv') {
  const supabase = getSupabaseClient();

  try {
    // Fetch average rating
    const { data: ratings, error: ratingsError } = await supabase
      .from('media_ratings')
      .select('rating')
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    const averageRating = ratings && ratings.length > 0
      ? ratings.reduce((sum, current) => sum + current.rating, 0) / ratings.length
      : 0;

    // Fetch views count
    const { data: views, error: viewsError } = await supabase
      .from('media_views')
      .select('views_count')
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .single();

    if (ratingsError || viewsError) {
      return { 
        data: null, 
        error: ratingsError?.message || viewsError?.message 
      };
    }

    return {
      data: {
        averageRating: averageRating.toFixed(1),
        viewsCount: views ? views.views_count : 0,
      },
      error: null
    };
  } catch (e) {
    return { data: null, error: 'An unexpected error occurred.' };
  }
}