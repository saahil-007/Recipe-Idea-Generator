import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, ChefHat, Share2, Eye } from 'lucide-react';
import { MealSummary } from '@/lib/api';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  meal: MealSummary;
  isFavorite?: boolean;
  estimatedTime?: number;
  onViewDetails: (meal: MealSummary) => void;
  onToggleFavorite: (meal: MealSummary) => void;
  onShare?: (meal: MealSummary) => void;
  className?: string;
}

export function RecipeCard({
  meal,
  isFavorite = false,
  estimatedTime,
  onViewDetails,
  onToggleFavorite,
  onShare,
  className
}: RecipeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onShare) {
      onShare(meal);
      return;
    }

    // Fallback share functionality
    const shareData = {
      title: meal.strMeal,
      text: `Check out this recipe: ${meal.strMeal}`,
      url: `${window.location.origin}?recipe=${meal.idMeal}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 bg-gradient-card border-0 overflow-hidden",
        className
      )}
      onClick={() => onViewDetails(meal)}
    >
      {/* Recipe Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {!imageError ? (
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
              imageLoading && "opacity-0"
            )}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {imageLoading && !imageError && (
          <div className="absolute inset-0 bg-gradient-warm animate-pulse" />
        )}

        {/* Favorite Heart */}
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(meal);
          }}
          className={cn(
            "absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm border-0 hover:bg-background/90 transition-all duration-200",
            isFavorite && "text-destructive hover:text-destructive/80"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </Button>

        {/* Time Badge */}
        {estimatedTime && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            ~{estimatedTime}min
          </Badge>
        )}
      </div>

      {/* Recipe Info */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
          {meal.strMeal}
        </h3>
        <p className="text-sm text-muted-foreground">
          International cuisine • Main course
        </p>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(meal);
          }}
          className="flex-1 mr-2"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Recipe
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShare}
          className="h-9 w-9 p-0"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}