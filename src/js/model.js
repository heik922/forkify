// the module that we write the entire model

/*
    export STATE  
    1. Recipe
    2. Search
    3. bookmarks
    4. export loadRecipe 
*/

import { async } from 'regenerator-runtime';
import { API_URL, RESULTS_PER_PAGE } from './config.js';
import { getJSON } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    keyword: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
};

// 1) Recipe
export const loadRecipe = async function (id) {
  try {
    // loading recipe
    const result = await getJSON(`${API_URL}/${id}`);

    // getting rid of result properties name with underscores
    let recipe = result.data.recipe;
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };
  } catch (err) {
    throw err;
  }
};

// 2) Search
export const loadSearchResult = async function (keyword) {
  try {
    state.search.keyword = keyword;

    const result = await getJSON(`${API_URL}?search=${keyword}`);

    state.search.results = result.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
      };
    });
  } catch (err) {
    throw err;
  }
};

export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  // 0 - 9 for page 1 , slice does not include the last index
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 10
  return state.search.results.slice(start, end);
};

export const updateServings = function (numServings) {
  state.recipe.ingredients;
};
