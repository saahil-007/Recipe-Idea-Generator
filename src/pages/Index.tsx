import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { RecipeGrid } from '@/components/RecipeGrid';
import { RecipeModal } from '@/components/RecipeModal';
import { FavoritesList } from '@/components/FavoritesList';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChefHat } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useFavorites } from '@/hooks/useFavorites';
import { MealSummary } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedMeal, setSelectedMeal] = useState<MealSummary | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const { toast } = useToast();
  const search = useSearch();
  const favorites = useFavorites();

  const handleViewDetails = (meal: MealSummary) => {
    setSelectedMeal(meal);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMeal(null);
  };

  const handleToggleFavorite = (meal: MealSummary, details?: any) => {
    favorites.toggleFavorite(meal, details);
    
    if (favorites.isFavorite(meal.idMeal)) {
      toast({
        title: "Recipe removed",
        description: `${meal.strMeal} has been removed from your favorites.`,
      });
    } else {
      toast({
        title: "Recipe saved",
        description: `${meal.strMeal} has been added to your favorites.`,
      });
    }
  };

  const favoriteIds = new Set(favorites.favorites.map(fav => fav.id));

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Recipe Ideas</h1>
                <p className="text-sm text-muted-foreground">Cook from what's in your pantry</p>
              </div>
            </div>
            

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search and Results */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Bar */}
            <SearchBar
              ingredients={search.ingredients}
              filters={search.filters}
              isLoading={search.isLoading}
              onAddIngredient={search.addIngredient}
              onRemoveIngredient={search.removeIngredient}
              onUpdateFilters={search.updateFilters}
              onSearch={search.search}
              onClear={search.clearSearch}
            />

            {/* Recipe Results */}
            <RecipeGrid
              recipes={search.results}
              isLoading={search.isLoading}
              error={search.error}
              hasSearched={search.hasSearched}
              favoriteIds={favoriteIds}
              onViewDetails={handleViewDetails}
              onToggleFavorite={handleToggleFavorite}
              onRetry={search.search}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FavoritesList
              favorites={favorites.favorites}
              onViewDetails={handleViewDetails}
              onRemoveFavorite={favorites.removeFavorite}
              onExportFavorites={favorites.exportFavorites}
              onImportFavorites={favorites.importFavorites}
            />
          </div>
        </div>
      </main>



      {/* Recipe Detail Modal */}
      <RecipeModal
        meal={selectedMeal}
        isOpen={showModal}
        onClose={handleCloseModal}
        isFavorite={selectedMeal ? favoriteIds.has(selectedMeal.idMeal) : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
};

export default Index;