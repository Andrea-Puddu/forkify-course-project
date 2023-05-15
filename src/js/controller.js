import * as Model from "./model";
import { MOD_CLOSE_SEC } from "./config";
import RecipeView from "./views/recipeView";
import SearchView from "./views/searchView";
import ResultsView from "./views/resultsView";
import PaginationView from "./views/paginationView";
import BookmarksView from "./views/bookmarksView";
import AddRecipeView from "./views/addRecipeView";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { async } from "regenerator-runtime";

// https://forkify-api.herokuapp.com/v2

// if (module.hot) {
//   module.hot.accept();
// }

///////////////////////////////////////
const controlRecipes = async function () {
  try {
    // getting recipe id from recipe hash
    const id = window.location.hash.slice(1);

    if (!id) return;

    // marking selected search results
    ResultsView.update(Model.getSearchResultsPage());
    BookmarksView.update(Model.state.bookmarks);

    // loading spinner
    RecipeView.renderSpinner();

    // loading recipe
    await Model.loadRecipe(id);

    // rendering recipe
    RecipeView.render(Model.state.recipe);
  } catch (err) {
    RecipeView.renderError();
  }
};

///////////////////////////////////////
const controlSearchResults = async function () {
  try {
    // getting query
    const query = SearchView.getQuery();
    if (!query) return;

    // loading spinner
    ResultsView.renderSpinner();

    // loading search results
    await Model.loadSearchResults(query);

    // rendering results
    ResultsView.render(Model.getSearchResultsPage());

    // rendering initial pagination buttons
    PaginationView.render(Model.state.search);
  } catch (err) {
    console.log(err);
  }
};

///////////////////////////////////////
const controlPagination = function (goToPage) {
  // rendering new results
  ResultsView.render(Model.getSearchResultsPage(goToPage));

  // rendering new pagination buttons
  PaginationView.render(Model.state.search);
};

///////////////////////////////////////
const controlServings = function (newServings) {
  // update recipe servings (in state)
  Model.updateServings(newServings);
  // update recipe view
  RecipeView.update(Model.state.recipe);
};

///////////////////////////////////////
const controlAddBookmark = function (recipe) {
  // add/remove bookmark
  if (!Model.state.recipe.bookmarked) Model.addBookmark(Model.state.recipe);
  else Model.deleteBookmark(Model.state.recipe.id);

  // update receipe view
  RecipeView.update(Model.state.recipe);

  // render bookmarks
  BookmarksView.render(Model.state.bookmarks);
};

///////////////////////////////////////
const controlBookmarks = function () {
  BookmarksView.render(Model.state.bookmarks);
};

///////////////////////////////////////
const controlAddRecipe = async function (newRecipe) {
  try {
    // loading spinner
    AddRecipeView.renderSpinner();

    // upload new recipe data
    await Model.uploadRecipe(newRecipe);
    console.log(Model.state.recipe);

    // render new recipe
    RecipeView.render(Model.state.recipe);

    // render success message
    AddRecipeView.renderMessage();

    // render bookmark view
    BookmarksView.render(Model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, "", `${Model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, MOD_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("🔥", err);
    AddRecipeView.renderError(err.message);
  }
};

const init = function () {
  BookmarksView.addHandlerRender(controlBookmarks);
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerUpdateServings(controlServings);
  RecipeView.addHandlerAddBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
  RecipeView.addHandlerCloseRecipe();
  RecipeView.openRecipe();
};

init();
