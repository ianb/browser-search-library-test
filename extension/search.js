/* globals React, ReactDOM */

import { Search } from "./searchView.js";

function onSearch(term) {
  searchTerm = term;
}

let searchTerm;
let searchResults;

function render() {
  const container = document.getElementById("container");
  ReactDOM.render(
    React.createElement(Search, {
      searchResults,
      searchTerm,
      onSearch,
    }),
    container
  );
}

render();
