import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";
import { useQuery } from "@tanstack/react-query";

export function useStreak() {
  const { user, isAuthenticated } = useAuth();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/streak"],
    enabled: !!isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  // Refetches the streak data - call this after new activity like
  // completing a journal entry or guided lesson
  const refreshStreak = async () => {
    await refetch();
  };

  // Use a type assertion to specify the streak data shape
  const streakData = data as { currentStreak: number } | undefined;

  return {
    streak: streakData?.currentStreak || (user?.currentStreak ?? 0),
    isLoading,
    error,
    refreshStreak,
  };
}