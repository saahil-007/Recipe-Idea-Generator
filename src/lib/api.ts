// TheMealDB API integration for Recipe Ideas app

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface MealDetail {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
  strSource?: string;
  strImageSource?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
}

export interface ProcessedIngredient {
  ingredient: string;
  measure: string;
}

// Fetch meals by ingredient
export async function searchByIngredient(ingredient: string): Promise<MealSummary[]> {
  try {
    const url = `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient.trim())}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching meals by ingredient:', error);
    throw new Error('Failed to search recipes. Please try again.');
  }
}

// Fetch meal details by ID
export async function getMealDetails(idMeal: string): Promise<MealDetail | null> {
  try {
    const url = `${BASE_URL}/lookup.php?i=${idMeal}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.meals?.[0] || null;
  } catch (error) {
    console.error('Error fetching meal details:', error);
    throw new Error('Failed to load recipe details. Please try again.');
  }
}

// Multi-ingredient search with intersection logic
export async function searchByMultipleIngredients(ingredients: string[]): Promise<MealSummary[]> {
  if (ingredients.length === 0) return [];
  
  try {
    // Fetch results for each ingredient
    const resultSets = await Promise.all(
      ingredients.map(ingredient => searchByIngredient(ingredient))
    );
    
    if (resultSets.length === 1) {
      return resultSets[0];
    }
    
    // Find intersection of all result sets
    const firstSet = resultSets[0];
    const intersection = firstSet.filter(meal =>
      resultSets.every(resultSet =>
        resultSet.some(otherMeal => otherMeal.idMeal === meal.idMeal)
      )
    );
    
    // If intersection is empty, return union sorted by relevance
    if (intersection.length === 0) {
      const allMeals = resultSets.flat();
      const mealCounts = new Map<string, { meal: MealSummary; count: number }>();
      
      allMeals.forEach(meal => {
        const existing = mealCounts.get(meal.idMeal);
        if (existing) {
          existing.count++;
        } else {
          mealCounts.set(meal.idMeal, { meal, count: 1 });
        }
      });
      
      // Sort by count (most matching ingredients first)
      return Array.from(mealCounts.values())
        .sort((a, b) => b.count - a.count)
        .map(item => item.meal);
    }
    
    return intersection;
  } catch (error) {
    console.error('Error in multi-ingredient search:', error);
    throw error;
  }
}

// Process meal ingredients into clean format
export function processIngredients(meal: MealDetail): ProcessedIngredient[] {
  const ingredients: ProcessedIngredient[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDetail] as string;
    const measure = meal[`strMeasure${i}` as keyof MealDetail] as string;
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : ''
      });
    }
  }
  
  return ingredients;
}

// Estimate cooking time based on category heuristics
export function estimateCookingTime(category: string, area: string): number {
  const categoryTimes: Record<string, number> = {
    'soup': 45,
    'salad': 15,
    'pasta': 25,
    'rice': 35,
    'curry': 40,
    'stew': 60,
    'casserole': 50,
    'pizza': 30,
    'sandwich': 10,
    'breakfast': 20,
    'dessert': 35,
  };
  
  const lowerCategory = category.toLowerCase();
  for (const [key, time] of Object.entries(categoryTimes)) {
    if (lowerCategory.includes(key)) {
      return time;
    }
  }
  
  // Default estimation
  return 30;
}