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
          <NoSearch isSearching={this.props.isSearching} />
        )}
        {this.props.browserData ? (
          <BrowserData data={this.props.browserData} />
        ) : null}
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
    const emptyResults = [];
    const results = [];
    for (const title in this.props.searchResults.collections) {
      const collection = this.props.searchResults.collections[title];
      let anyResults = false;
      for (const providerName in collection) {
        if (collection[providerName].matches.length) {
          anyResults = true;
        }
      }
      if (!anyResults) {
        emptyResults.push(<EmptyCollection key={title} title={title} />);
        continue;
      }
      results.push(
        <CollectionSearchResults
          key={title}
          title={title}
          results={collection}
        />
      );
    }
    if (!results.length) {
      return <div id="no-search">No search results</div>;
    }
    if (emptyResults.length) {
      return (
        <div>
          <div>{emptyResults}</div>
          <div className="allCollections">{results}</div>
        </div>
      );
    }
    return <div className="allCollections">{results}</div>;
  }
}

class EmptyCollection extends React.Component {
  render() {
    return (
      <div>
        <strong>{this.props.title}</strong>: no results
      </div>
    );
  }
}

class CollectionSearchResults extends React.Component {
  render() {
    const providerResults = [];
    for (const key in this.props.results) {
      const p = this.props.results[key];
      providerResults.push(
        <ProviderSearchResults
          key={key}
          provider={p.provider}
          time={p.time}
          matches={p.matches}
        />
      );
    }
    return (
      <div className="collection">
        <h3>{this.props.title}</h3>
        <div>{providerResults}</div>
      </div>
    );
  }
}

class ProviderSearchResults extends React.Component {
  render() {
    if (!this.props.matches.length) {
      return (
        <div className="provider">
          <strong>{this.props.provider.name}</strong>: no results (
          {this.props.time}ms)
        </div>
      );
    }
    const items = [];
    for (const item of this.props.matches) {
      let val;
      let info = [];
      for (const key in item.info) {
        info.push(
          <span key={key} className="info-value">
            <span>{key}:</span>
            <code>{JSON.stringify(item.info[key])}</code>
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
          <span>
            <a
              href={item.item.url}
              data-id={item.item.id}
              target="_blank"
              rel="noopener"
            >
              {item.item.description}
            </a>
            {info}
          </span>
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
      <div className="provider">
        <h4>{this.props.provider.name}</h4>
        <div>
          Time: {this.props.time}ms <br />
          Number of results: {this.props.matches.length}
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
