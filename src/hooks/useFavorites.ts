import { useState, useEffect, useCallback } from 'react';
import { MealSummary, MealDetail } from '@/lib/api';

export interface FavoriteRecipe {
  id: string;
  meal: MealSummary;
  details?: MealDetail;
  savedAt: number;
}

const FAVORITES_KEY = 'recipeFavorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((meal: MealSummary, details?: MealDetail) => {
    const newFavorite: FavoriteRecipe = {
      id: meal.idMeal,
      meal,
      details,
      savedAt: Date.now(),
    };

    setFavorites(prev => {
      // Remove existing if present, then add to top
      const filtered = prev.filter(fav => fav.id !== meal.idMeal);
      return [newFavorite, ...filtered];
    });
  }, []);

  const removeFavorite = useCallback((mealId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== mealId));
  }, []);

  const isFavorite = useCallback((mealId: string) => {
    return favorites.some(fav => fav.id === mealId);
  }, [favorites]);

  const toggleFavorite = useCallback((meal: MealSummary, details?: MealDetail) => {
    if (isFavorite(meal.idMeal)) {
      removeFavorite(meal.idMeal);
    } else {
      addFavorite(meal, details);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  const exportFavorites = useCallback(() => {
    const exportData = {
      favorites,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [favorites]);

  const importFavorites = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.favorites && Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
        }
      } catch (error) {
        console.error('Error importing favorites:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    exportFavorites,
    importFavorites,
  };
}