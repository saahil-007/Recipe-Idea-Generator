import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Download, 
  Upload, 
  Trash2, 
  Eye, 
  Clock,
  FileUp
} from 'lucide-react';
import { FavoriteRecipe } from '@/hooks/useFavorites';
import { MealSummary } from '@/lib/api';
import { cn } from '@/lib/utils';

interface FavoritesListProps {
  favorites: FavoriteRecipe[];
  onViewDetails: (meal: MealSummary) => void;
  onRemoveFavorite: (mealId: string) => void;
  onExportFavorites: () => void;
  onImportFavorites: (file: File) => void;
  className?: string;
}

export function FavoritesList({ 
  favorites, 
  onViewDetails, 
  onRemoveFavorite, 
  onExportFavorites, 
  onImportFavorites,
  className 
}: FavoritesListProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportFavorites(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onImportFavorites(files[0]);
    }
  };

  if (favorites.length === 0) {
    return (
      <Card className={cn("bg-gradient-card border-0", className)}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No saved recipes yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start saving recipes you love by clicking the heart icon on any recipe card.
            </p>
            
            {/* Import Option */}
            <div
              className={cn(
                "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors",
                dragOver && "border-primary bg-primary/5"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Have exported favorites? Drop them here to import
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gradient-card border-0", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Saved Recipes ({favorites.length})
          </CardTitle>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
            </label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportFavorites}
              disabled={favorites.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-6 pt-0">
            {favorites.map((favorite, index) => (
              <div key={favorite.id}>
                <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors">
                  {/* Recipe Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={favorite.meal.strMealThumb}
                      alt={favorite.meal.strMeal}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>

                  {/* Recipe Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {favorite.meal.strMeal}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {favorite.details && (
                        <>
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {favorite.details.strCategory}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            <Clock className="h-3 w-3 mr-1" />
                            ~30min
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(favorite.meal)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFavorite(favorite.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {index < favorites.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}