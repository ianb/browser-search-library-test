/* globals React, ReactDOM */

import { Search } from "./searchView.js";
import { collectData } from "./dataInput.js";
import { executeSearch } from "./providers.js";

async function onSearch(term) {
  searchTerm = term;
  isSearching = true;
  render();
  browserData = await collectData();
  render();
  searchResults = await executeSearch(browserData, term);
  render();
}

let isSearching = false;
let browserData;
let searchTerm;
let searchResults;

function render() {
  const container = document.getElementById("container");
  ReactDOM.render(
    React.createElement(Search, {
      searchResults,
      searchTerm,
      onSearch,
      browserData,
      isSearching,
    }),
    container
  );
}

render();
