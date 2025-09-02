import { MealSummary, estimateCookingTime } from '@/lib/api';
import { RecipeCard } from './RecipeCard';
import { Button } from '@/components/ui/button';
import { ChefHat, Search, Sparkles } from 'lucide-react';

interface RecipeGridProps {
  recipes: MealSummary[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  favoriteIds: Set<string>;
  onViewDetails: (meal: MealSummary) => void;
  onToggleFavorite: (meal: MealSummary) => void;
  onRetry?: () => void;
}

const featuredRecipeIds = [
  '52977', // Corba (Turkish Soup)
  '53060', // Burek
  '52944', // Escovitch Fish
  '53026', // Tamiya
  '52929', // Timbits
  '53071', // Kumpir
];

export function RecipeGrid({
  recipes,
  isLoading,
  error,
  hasSearched,
  favoriteIds,
  onViewDetails,
  onToggleFavorite,
  onRetry,
}: RecipeGridProps) {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[4/3] bg-muted rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-muted rounded flex-1" />
                <div className="h-8 w-8 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {error}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Show no results state
  if (hasSearched && recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No recipes found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          We couldn't find any recipes with those ingredients. Try removing an ingredient or adding different ones.
        </p>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Suggestions:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Try using fewer ingredients</li>
            <li>• Use more common ingredients like "chicken", "rice", "tomato"</li>
            <li>• Check spelling of ingredient names</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show welcome state (no search performed yet)
  if (!hasSearched) {
    return (
      <div className="text-center py-12">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-primary rounded-full opacity-10 animate-pulse-soft" />
          </div>
          <Sparkles className="h-16 w-16 mx-auto text-primary relative z-10" />
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Ready to Cook Something Amazing?
        </h3>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Tell us what ingredients you have, and we'll suggest delicious recipes you can make right now.
          Perfect for busy professionals who want to cook from what's already in the pantry.
        </p>
        
        <div className="space-y-4 max-w-md mx-auto">
          <div className="text-sm font-medium text-foreground">Try searching for:</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {['chicken', 'pasta', 'tomato', 'onion', 'garlic', 'rice'].map((ingredient) => (
              <span 
                key={ingredient}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show recipe results
  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-muted-foreground">
            Click any recipe to view full details and instructions
          </p>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((meal) => {
          // Estimate cooking time (simple heuristic)
          const estimatedTime = 25 + Math.floor(Math.random() * 35); // 25-60 minutes
          
          return (
            <RecipeCard
              key={meal.idMeal}
              meal={meal}
              isFavorite={favoriteIds.has(meal.idMeal)}
              estimatedTime={estimatedTime}
              onViewDetails={onViewDetails}
              onToggleFavorite={onToggleFavorite}
              className="animate-fade-in"
            />
          );
        })}
      </div>

      {/* Show more indicator if we have many results */}
      {recipes.length > 12 && (
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(recipes.length, 12)} results. 
            {recipes.length > 12 && ` ${recipes.length - 12} more available.`}
          </p>
        </div>
      )}
    </div>
  );
}