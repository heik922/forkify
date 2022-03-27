// the module that we write the entire model

/*
    export STATE  
    1. Recipe
    2. Search
    3. bookmarks
    4. export loadRecipe 
*/

import { async } from 'regenerator-runtime';
import { API_URL, RESULTS_PER_PAGE, API_KEY } from './config.js';
import { getJSON, sendJSON } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    keyword: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

// 1) Recipe
export const loadRecipe = async function (id) {
  try {
    // loading recipe
    const result = await getJSON(`${API_URL}/${id}?key=${API_KEY}`);

    // getting rid of result properties name with underscores
    state.recipe = createRecipeObject(result);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
};

// 2) Search
export const loadSearchResult = async function (keyword) {
  try {
    state.search.keyword = keyword;

    const result = await getJSON(`${API_URL}?search=${keyword}&key=${API_KEY}`);

    state.search.results = result.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// 3 ) Bookmark and unbookmark
export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark by setting a new property
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
  console.log(state.bookmarks);
};

export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  // 0 - 9 for page 1 , slice does not include the last index
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 10
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings = state.recipe.servings) {
  state.recipe.ingredients.forEach(ing => {
    // new quantity = old quantity * new servings / old servings
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

init();

// temp debugging function
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

//clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  // take the raw input data and transform it into API data
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll(' ', '').split(',');
        // check if ingredient has correct format
        if (ingArr.length !== 3) {
          throw new Error(
            'Wrong ingredient formar. Please use the correct format.'
          );
        }
        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await sendJSON(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
