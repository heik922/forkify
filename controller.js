// imports
import * as model from './src/js/model.js';
import recipeView from './src/js/views/recipeView.js';
import searchView from './src/js/views/searchView.js';
import searchResultView from './src/js/views/searchResultView.js';
import paginationView from './src/js/views/paginationView.js';
import bookmarksView from './src/js/views/bookmarksView.js';
import addRecipeView from './src/js/views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './src/js/config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { add } from 'lodash-es';

if (module.hot) {
  module.hot.accept();
}

// API website :
// https://forkify-api.herokuapp.com/v2

const controlRecipe = async function () {
  try {
    // getting the harsh
    const id = window.location.hash.slice(1);
    if (!id) return;

    // loading spinner
    recipeView.renderSpinner();

    // 0 ) update result view to mark selected search result
    searchResultView.update(model.getSearchResultPage());

    // 1 ) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2 ) loading recipe from state
    // we will have access to state.recipe now
    await model.loadRecipe(id);

    // 3) renderring the recipe in view
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    const keyword = searchView.getKeyword();
    if (!keyword) return;

    searchResultView.renderSpinner();
    await model.loadSearchResult(keyword);
    searchResultView.render(model.getSearchResultPage());

    // render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
  searchResultView.render(model.getSearchResultPage(gotoPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update recipe serving (in state)
  model.updateServings(newServings);

  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Remove Bookmarks
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2) Updates bookmarks
  recipeView.update(model.state.recipe);

  // 3) Render Bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  //upload the new recipe data ...

  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    // upload the recipe
    await model.uploadRecipe(newRecipe);

    // render the recipe on HTML
    recipeView.render(model.state.recipe);

    // success msg
    addRecipeView.renderSuccess();

    // re-render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close the form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err);
  }
};

// subscribers
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addEventListener(controlSearchResults);
  paginationView.addhandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
