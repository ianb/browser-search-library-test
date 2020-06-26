/* eslint-disable jsx-a11y/no-autofocus */
// eslint isn't understanding JSX vars, so this has to be disabled:
/* eslint-disable no-unused-vars */
/* globals React */

import { providers } from "./providers.js";

export class Search extends React.Component {
  render() {
    return (
      <div>
        <SearchField onSearch={this.props.onSearch} />
        {this.props.searchResults ? (
          <SearchResults searchResults={this.props.searchResults} />
        ) : (
          <NoSearch />
        )}
        <ProviderList />
      </div>
    );
  }
}

class SearchField extends React.Component {
  render() {
    return (
      <div>
        <fieldset>
          <legend>Search</legend>
          <form onSubmit={this.onSubmit.bind(this)}>
            <input type="text" autoFocus="1" placeholder="Search..." />
          </form>
        </fieldset>
      </div>
    );
  }

  onSubmit(event) {
    event.preventDefault();
  }
}

class SearchResults extends React.Component {
  render() {
    return <div>Not implemented</div>;
  }
}

class NoSearch extends React.Component {
  render() {
    return <div id="no-search">Enter a search</div>;
  }
}

class ProviderList extends React.Component {
  render() {
    const names = Object.keys(providers).sort();
    const lis = [];
    for (const name of names) {
      const p = providers[name];
      lis.push(
        <li key={name}>
          <a href={p.url} target="_blank" rel="noopener">
            {p.name}
          </a>
        </li>
      );
    }
    return (
      <div>
        <ul id="provider-list">{lis}</ul>
      </div>
    );
  }
}
