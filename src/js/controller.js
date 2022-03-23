// imports
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import searchResultView from './views/searchResultView.js';
import paginationView from './views/paginationView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

// API website :
// https://forkify-api.herokuapp.com/v2

const controlRecipe = async function () {
  try {
    // getting the harsh
    const id = window.location.hash.slice(1);
    if (!id) return;

    // loading spinner
    recipeView.renderSpinner();

    // 1 ) loading recipe from state
    // we will have access to state.recipe now
    await model.loadRecipe(id);
    console.log(model.state.recipe);
    console.log('***********************************');
    // 2) renderring the recipe in view
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

    //searchResultView.render(model.state.search.results);
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

const controlServings = function () {
  // update recipe serving (in state)
  model.updateServings(6);

  // update the recipe view
};

// subscribers
const init = function () {
  recipeView.addHandlerRender(controlRecipe);
  searchView.addEventListener(controlSearchResults);
  paginationView.addhandlerClick(controlPagination);
};

init();
