  import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Plus, Search, X, Clock, Sparkles, RotateCcw } from 'lucide-react';
import { MoodFilter, TimeFilter, SearchFilters } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  ingredients: string[];
  filters: SearchFilters;
  isLoading: boolean;
  onAddIngredient: (ingredient: string) => void;
  onRemoveIngredient: (ingredient: string) => void;
  onUpdateFilters: (filters: Partial<SearchFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
}

const moodOptions: { value: MoodFilter; label: string; icon: string }[] = [
  { value: 'quick', label: 'Quick', icon: '⚡' },
  { value: 'comfort', label: 'Comfort', icon: '🫂' },
  { value: 'healthy', label: 'Healthy', icon: '🥗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'low-carb', label: 'Low-carb', icon: '🥩' },
  { value: 'indulgent', label: 'Indulgent', icon: '🍰' },
];

const timePresets: TimeFilter[] = [15, 30, 60, 120];

export function SearchBar({ 
  ingredients, 
  filters, 
  isLoading, 
  onAddIngredient, 
  onRemoveIngredient, 
  onUpdateFilters, 
  onSearch,
  onClear
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAddIngredient(inputValue.trim());
      setInputValue('');
    }
  };

  const handleAddIngredient = () => {
    if (inputValue.trim()) {
      onAddIngredient(inputValue.trim());
      setInputValue('');
    }
  };

  const handleMoodToggle = (mood: MoodFilter) => {
    onUpdateFilters({
      mood: filters.mood === mood ? undefined : mood
    });
  };

  const handleTimeChange = (value: number[]) => {
    onUpdateFilters({
      timeLimit: value[0] as TimeFilter
    });
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-0">
      <div className="space-y-6">
        {/* Main Search Input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="What's in your pantry? (e.g., chicken, tomatoes, onion)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-4 pr-12 h-12 text-base border-2 border-primary/20 focus:border-primary bg-background/50"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={handleAddIngredient}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-1 top-1 h-10 w-10 p-0"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={onSearch}
              disabled={ingredients.length === 0 || isLoading}
              className="h-12 px-6 bg-gradient-primary hover:shadow-warm transition-all duration-300"
              size="lg"
            >
              {isLoading ? (
                <div className="animate-pulse-soft">
                  <Search className="h-5 w-5" />
                </div>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Find Recipes
                </>
              )}
            </Button>
            {ingredients.length > 0 && (
              <Button
                onClick={onClear}
                variant="ghost"
                className="h-12 px-4 text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Ingredient Chips */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="px-3 py-1 text-sm bg-accent/10 text-primary border border-accent/20 hover:bg-accent/20 transition-colors"
                >
                  {ingredient}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveIngredient(ingredient)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {(filters.mood || filters.timeLimit) && (
            <Badge variant="outline" className="text-xs">
              {[
                filters.mood && `${filters.mood}`,
                filters.timeLimit && `≤${filters.timeLimit}min`
              ].filter(Boolean).join(', ')}
            </Badge>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 animate-slide-up">
            {/* Mood Filters */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                What's your mood?
              </label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={filters.mood === option.value ? "default" : "outline"}
                    onClick={() => handleMoodToggle(option.value)}
                    className="text-sm"
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Max cooking time
                </label>
                <span className="text-sm text-muted-foreground">
                  {filters.timeLimit || 120} minutes
                </span>
              </div>
              
              <Slider
                value={[filters.timeLimit || 120]}
                onValueChange={handleTimeChange}
                min={5}
                max={120}
                step={5}
                className="w-full"
              />
              
              <div className="flex justify-between mt-2">
                {timePresets.map((time) => (
                  <Button
                    key={time}
                    size="sm"
                    variant="ghost"
                    onClick={() => onUpdateFilters({ timeLimit: time })}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {time}min
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}