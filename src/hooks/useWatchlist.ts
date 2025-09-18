// src/hooks/useWatchlist.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from './useUser';
import { Movie, TVShow, MultiSearchResultItem } from '@/lib/tmdb';
import { supabase } from '@/lib/supabaseClient';

interface DBWatchlistItem {
  id: number;
  tmdb_id: number;
  user_id: string;
  title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  vote_average?: number | null;
  content_type: 'movies' | 'tv'; // <-- UPDATED TYPE
}

export type WatchlistItem = (Movie & { type: 'movie' }) | (TVShow & { type: 'tv' });

const getInitialState = (user: any): WatchlistItem[] => {
  if (typeof window === 'undefined' || !user) {
    return [];
  }
  try {
    const storedList = localStorage.getItem(`watchlist-${user.id}`);
    return storedList ? JSON.parse(storedList) : [];
  } catch (error) {
    console.error("Failed to parse watchlist from localStorage", error);
    return [];
  }
};

export const useWatchlist = () => {
  const user = useUser();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => getInitialState(user));

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_watchlist')
        .select('*')
        .eq('user_id', user.id)
        .returns<DBWatchlistItem[]>();

      if (error) {
        console.error('Error fetching watchlist:', error);
      } else {
        const dbWatchlist = data.map((item) => {
          const baseItem = {
            id: item.tmdb_id,
            overview: item.overview,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
          } as any;

          if (item.content_type === 'movies') { // <-- UPDATED CHECK
            return {
              ...baseItem,
              title: item.title,
              type: 'movie', // <-- Type still remains singular for your application logic
            };
          } else {
            return {
              ...baseItem,
              name: item.title,
              type: 'tv',
            };
          }
        });
        setWatchlist(dbWatchlist as WatchlistItem[]);
        localStorage.setItem(`watchlist-${user.id}`, JSON.stringify(dbWatchlist));
      }
    };
    fetchWatchlist();
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`watchlist-${user.id}`, JSON.stringify(watchlist));
    }
  }, [watchlist, user]);

  const addItem = useCallback(
    async (item: Movie | TVShow | MultiSearchResultItem) => {
      if (!user) return;
      const existingItem = watchlist.find((i) => i.id === item.id);
      if (existingItem) return;
      
      const newItem = { 
        ...item,
        type: 'media_type' in item ? item.media_type : ('title' in item ? 'movie' : 'tv')
      } as WatchlistItem;

      const { data, error } = await supabase
        .from('user_watchlist')
        .insert({
          user_id: user.id,
          tmdb_id: item.id,
          title: 'title' in item ? item.title : item.name,
          overview: item.overview,
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          content_type: newItem.type === 'movie' ? 'movies' : 'tv', // <-- UPDATED MAPPING
        });

      if (error) {
        console.error('Error adding item to watchlist:', error);
      } else {
        setWatchlist((prev) => [...prev, newItem]);
      }
    },
    [watchlist, user]
  );
  
  const removeItem = useCallback(
    async (id: number) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', id);

      if (error) {
        console.error('Error removing item from watchlist:', error);
      } else {
        setWatchlist((prev) => prev.filter((item) => item.id !== id));
      }
    },
    [user]
  );

  const isItemInWatchlist = useCallback(
    (id: number) => {
      return watchlist.some((item) => item.id === id);
    },
    [watchlist]
  );
  
  return useMemo(() => ({
    watchlist,
    addItem,
    removeItem,
    isItemInWatchlist
  }), [watchlist, addItem, removeItem, isItemInWatchlist]);
};