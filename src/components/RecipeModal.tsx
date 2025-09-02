import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Heart,
  Clock,
  ChefHat,
  ExternalLink,
  Download,
  Share2,
  Play,
  CheckCircle2,
  Globe,
  Printer
} from 'lucide-react';
import { MealSummary, MealDetail, getMealDetails, processIngredients, estimateCookingTime } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RecipeModalProps {
  meal: MealSummary | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite: (meal: MealSummary, details?: MealDetail) => void;
}

export function RecipeModal({
  meal,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite
}: RecipeModalProps) {
  const [details, setDetails] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  useEffect(() => {
    if (!meal || !isOpen) {
      setDetails(null);
      setError(null);
      setCheckedIngredients(new Set());
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const mealDetails = await getMealDetails(meal.idMeal);
        setDetails(mealDetails);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recipe details';
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Failed to load recipe details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [meal, isOpen, toast]);

  const handleRetry = () => {
    if (meal) {
        const fetchDetails = async () => {
          setLoading(true);
          setError(null);
          try {
            const mealDetails = await getMealDetails(meal.idMeal);
            setDetails(mealDetails);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recipe details');
          } finally {
            setLoading(false);
          }
        };
        fetchDetails();
      }
  }

  const toggleIngredientCheck = (ingredient: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient);
      } else {
        newSet.add(ingredient);
      }
      return newSet;
    });
  };

  const handleDownload = () => {
    if (!meal || !details) return;

    const exportData = {
      recipe: {
        id: meal.idMeal,
        name: meal.strMeal,
        category: details.strCategory,
        area: details.strArea,
        instructions: details.strInstructions,
        ingredients: processIngredients(details),
        image: meal.strMealThumb,
        source: details.strSource,
        youtube: details.strYoutube,
        tags: details.strTags?.split(',').map(tag => tag.trim()),
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meal.strMeal.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-recipe.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Recipe downloaded",
      description: "Recipe has been saved to your device.",
    });
  };

  const handleShare = async () => {
    if (!meal) return;

    const shareData = {
      title: meal.strMeal,
      text: `Check out this delicious recipe: ${meal.strMeal}`,
      url: `${window.location.origin}?recipe=${meal.idMeal}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        toast({
          title: "Link copied",
          description: "Recipe link has been copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Sharing failed",
        description: "Could not share the recipe.",
        variant: "destructive"
      })
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !meal) return null;

  const renderLoading = () => (
    <div className="flex items-center justify-center h-full p-6">
      <div className="animate-pulse-soft text-center">
        <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading recipe details...</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12 px-6">
      <p className="text-destructive mb-4">{error}</p>
      <Button variant="outline" onClick={handleRetry}>
        Try Again
      </Button>
    </div>
  );

  const renderDetails = () => {
    if (!details) return null;

    const ingredients = processIngredients(details);
    const estimatedTime = estimateCookingTime(details.strCategory, details.strArea);
    const instructions = details.strInstructions.split('\n').filter(line => line.trim());

    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted shadow-warm">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-full object-cover"
            />
          </div>

          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="extras">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="pt-6 space-y-4">
              <div className="grid gap-2">
                {ingredients.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-background/50 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`ingredient-${index}`}
                      checked={checkedIngredients.has(item.ingredient)}
                      onCheckedChange={() => toggleIngredientCheck(item.ingredient)}
                    />
                    <label
                      htmlFor={`ingredient-${index}`}
                      className={cn(
                        "flex-1 text-base cursor-pointer transition-colors",
                        checkedIngredients.has(item.ingredient) && "line-through text-green-500"
                      )}
                    >
                      <span className="font-semibold text-foreground">{item.measure}</span> <span className="text-muted-foreground">{item.ingredient}</span>
                    </label>
                    {checkedIngredients.has(item.ingredient) && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>

              {ingredients.length > 0 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    {checkedIngredients.size} of {ingredients.length} ingredients checked
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="instructions" className="pt-6 space-y-4">
              <div className="space-y-4 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 rounded-lg bg-background/50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold mt-1">
                      {index + 1}
                    </div>
                    <p className="text-base leading-relaxed text-foreground/90 flex-1">
                      {instruction.trim()}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="extras" className="pt-6 space-y-6">
              {details.strTags && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {details.strTags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {details.strYoutube && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Video Tutorial</h4>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(details.strYoutube, '_blank')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </Button>
                </div>
              )}

              {details.strSource && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Original Recipe</h4>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(details.strSource, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Source
                  </Button>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Recipe
                </Button>
                <Button variant="outline" onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return renderLoading();
    }
    if (error) {
      return renderError();
    }
    if (details) {
      return renderDetails();
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] grid grid-rows-[auto_1fr] p-0 bg-gradient-card">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-foreground pr-4 leading-tight">
                {meal.strMeal}
              </DialogTitle>
              {details && (
                <div className="flex items-center flex-wrap gap-2 mt-3 text-sm text-muted-foreground">
                  <Badge variant="outline" className="gap-1.5 pl-2 pr-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                    <Globe className="h-3 w-3" />
                    {details.strArea}
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 pl-2 pr-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                    <ChefHat className="h-3 w-3" />
                    {details.strCategory}
                  </Badge>
                  {estimateCookingTime(details.strCategory, details.strArea) && (
                    <Badge variant="outline" className="gap-1.5 pl-2 pr-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                      <Clock className="h-3 w-3" />
                      ~{estimateCookingTime(details.strCategory, details.strArea)} min
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant={isFavorite ? "default" : "outline"}
                onClick={() => onToggleFavorite(meal, details || undefined)}
                className={cn(isFavorite && "bg-destructive hover:bg-destructive/90")}
              >
                <Heart className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}