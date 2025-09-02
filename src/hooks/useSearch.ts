import { useState, useEffect, useCallback } from 'react';
import { searchByMultipleIngredients, getMealDetails, estimateCookingTime, MealSummary } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export type MoodFilter = 'quick' | 'comfort' | 'healthy' | 'vegan' | 'low-carb' | 'indulgent';
export type TimeFilter = 15 | 30 | 60 | 120;

export interface SearchFilters {
  mood?: MoodFilter;
  timeLimit?: TimeFilter;
  excludeIngredients: string[];
}

export interface SearchState {
  ingredients: string[];
  filters: SearchFilters;
  results: MealSummary[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export function useSearch() {
  const [state, setState] = useState<SearchState>({
    ingredients: [],
    filters: { excludeIngredients: [] },
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  const { toast } = useToast();

  const addIngredient = useCallback((ingredient: string) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (!trimmed || state.ingredients.includes(trimmed)) return;
    
    setState(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, trimmed]
    }));
  }, [state.ingredients]);

  const removeIngredient = useCallback((ingredient: string) => {
    setState(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const search = useCallback(async () => {
    if (state.ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add at least one ingredient to search.",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await searchByMultipleIngredients(state.ingredients);
      
      // Apply filters
      let filteredResults = results;

      // 1. Mood filtering (simple heuristic based on category/tags)
      if (state.filters.mood) {
        filteredResults = results.filter(meal => {
          const name = meal.strMeal.toLowerCase();
          
          switch (state.filters.mood) {
            case 'quick':
              return name.includes('pasta') || name.includes('salad') || name.includes('sandwich');
            case 'comfort':
              return name.includes('soup') || name.includes('stew') || name.includes('casserole');
            case 'healthy':
              return name.includes('salad') || name.includes('grilled') || name.includes('steamed');
            case 'vegan':
              return !name.includes('chicken') && !name.includes('beef') && !name.includes('pork') && !name.includes('fish');
            default:
              return true;
          }
        });
      }

      // 2. Time filtering
      if (state.filters.timeLimit) {
        const detailedResults = await Promise.all(
          filteredResults.map(async (meal) => {
            const details = await getMealDetails(meal.idMeal);
            if (!details) return null;
            const time = estimateCookingTime(details.strCategory, details.strArea);
            return { ...meal, time };
          })
        );

        filteredResults = detailedResults
          .filter(meal => meal && meal.time <= state.filters.timeLimit!)
          .map(meal => meal as MealSummary);
      }

      setState(prev => ({
        ...prev,
        results: filteredResults,
        isLoading: false,
        hasSearched: true,
      }));

      // Save search to history
      const searchHistory = JSON.parse(localStorage.getItem('recipeSearchHistory') || '[]');
      const newSearch = {
        ingredients: state.ingredients,
        timestamp: Date.now(),
      };
      
      const updatedHistory = [newSearch, ...searchHistory.slice(0, 4)];
      localStorage.setItem('recipeSearchHistory', JSON.stringify(updatedHistory));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        hasSearched: true,
      }));
      
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [state.ingredients, state.filters, toast]);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      ingredients: [],
      filters: { excludeIngredients: [] },
      results: [],
      error: null,
      hasSearched: false,
    }));
  }, []);

  return {
    ...state,
    addIngredient,
    removeIngredient,
    updateFilters,
    search,
    clearSearch,
  };
}