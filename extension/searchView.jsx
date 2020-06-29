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
        {this.props.browserData ? (
          <BrowserData data={this.props.browserData} />
        ) : null}
        {this.props.searchResults ? (
          <SearchResults searchResults={this.props.searchResults} />
        ) : (
          <NoSearch isSearching={this.props.isSearching} />
        )}
        <ProviderList />
      </div>
    );
  }
}

class SearchField extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }

  render() {
    return (
      <div>
        <fieldset>
          <legend>Search</legend>
          <form onSubmit={this.onSubmit.bind(this)}>
            <input
              type="text"
              autoFocus="1"
              placeholder="Search..."
              ref={this.input}
            />
          </form>
        </fieldset>
      </div>
    );
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.onSearch(this.input.current.value);
  }
}

class BrowserData extends React.Component {
  render() {
    const data = this.props.data;
    const dataItems = [];
    for (const key in data.data) {
      const value = data.data[key];
      dataItems.push(<dt key={`key-${key}`}>{key}</dt>);
      dataItems.push(
        <dd key={`value-${key}`}>
          Items: {value.items.length} <br />
          Data: {value.totalContent} bytes <br />
          Time: {value.time}ms
        </dd>
      );
    }
    return (
      <fieldset>
        <legend>Browser data:</legend>
        <div>Collection time: {data.totalTime}ms</div>
        <dl>{dataItems}</dl>
      </fieldset>
    );
  }
}

class SearchResults extends React.Component {
  render() {
    const results = [];
    for (const name in this.props.searchResults) {
      results.push(
        <ProviderSearchResult
          key={name}
          name={name}
          data={this.props.searchResults[name]}
        />
      );
    }
    return <div>{results}</div>;
  }
}

class ProviderSearchResult extends React.Component {
  render() {
    const items = [];
    for (const item of this.props.data.items) {
      let val;
      let info = [];
      for (const key in item.info) {
        info.push(
          <span key={key} className="info-value">
            <span>{key}:</span>
            <code>{item.info[key]}</code>
          </span>
        );
      }
      if (!info.length) {
        info = null;
      } else {
        info = <span>{info}</span>;
      }
      if (item.item.url) {
        val = (
          <a href={item.item.url} target="_blank" rel="noopener">
            {item.item.description} {info}
          </a>
        );
      } else {
        val = (
          <span>
            {item.item.description} {info}
          </span>
        );
      }
      items.push(<li key={item.item.id}>{val}</li>);
    }
    return (
      <div>
        <h3>
          <a href={this.props.data.provider.url} target="_blank" rel="noopener">
            {this.props.data.provider.name}
          </a>
        </h3>
        <div>
          Time: {this.props.data.time}ms <br />
          Number of results: {this.props.data.items.length}
        </div>
        <ul>{items}</ul>
      </div>
    );
  }
}

class NoSearch extends React.Component {
  render() {
    if (this.props.isSearching) {
      return <div id="no-search">Searching...</div>;
    }
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
