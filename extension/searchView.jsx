/* eslint-disable jsx-a11y/no-autofocus */
// eslint isn't understanding JSX vars, so this has to be disabled:
/* eslint-disable no-unused-vars */
/* globals React */

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
    return <div>Enter a search</div>;
  }
}
