function uniqueById(items) {
  const ids = new Set();
  return items.filter((x) => {
    if (ids.has(x.id)) {
      return false;
    }
    ids.add(x.id);
    return true;
  });
}

export const dataInput = {
  bookmarks: {
    name: "Bookmarks",
    async getAll() {
      const results = await browser.bookmarks.search({});
      return results.map((b) => new Bookmark(b));
    },
  },
  history: {
    name: "History",
    async getAll() {
      let results = await browser.history.search({ text: "" });
      results = uniqueById(results);
      return results.map((h) => new History(h));
    },
  },
  recentHistory: {
    name: "Recent History",
    async getAll() {
      const TWO_WEEKS = 1000 * 60 * 60 * 24 * 14; // 14 days
      let results = await browser.history.search({
        text: "",
        startTime: Date.now() - TWO_WEEKS,
      });
      results = uniqueById(results);
      return results.map((h) => new History(h));
    },
  },
  tabs: {
    name: "Tab (not content)",
    async getAll() {
      const results = await browser.tabs.query({});
      return results.map((t) => new Tab(t, null));
    },
  },
  tabContent: {
    name: "Tab (with content)",
    async getAll() {
      const tabs = await browser.tabs.query({});
      const results = [];
      for (const t of tabs) {
        let content = "";
        try {
          await browser.tabs.executeScript(t.id, { file: "get-content.js" });
          content = await browser.tabs.sendMessage(t.id, {
            type: "getContent",
          });
        } catch (e) {
          if (!e.message.includes("Missing host permission")) {
            throw e;
          }
        }
        const item = new Tab(t, content);
        results.push(item);
      }
      return results;
    },
  },
};

export async function collectData() {
  const totalStartTime = Date.now();
  const results = {
    data: {},
    byId: new Map(),
  };
  for (const key of Object.keys(dataInput).sort()) {
    const input = dataInput[key];
    const startTime = Date.now();
    const items = await input.getAll();
    const time = Date.now() - startTime;
    let length = 0;
    for (const item of items) {
      results.byId.set(item.id, item);
      for (const prop of item.properties) {
        if (item[prop]) {
          length += item[prop].length;
        }
      }
    }
    results.data[key] = {};
    results.data[key].totalContent = length;
    results.data[key].time = time;
    results.data[key].items = items;
  }
  results.totalTime = Date.now() - totalStartTime;
  return results;
}

class Item {
  get description() {
    const name = this.constructor.name;
    return `${name}: ${this.title}/${this.id}`;
  }

  get indexed() {
    return this.properties
      .map((p) => this[p])
      .filter((x) => x)
      .join(" ");
  }
}

class Bookmark extends Item {
  constructor(bookmark) {
    super();
    // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
    this._bookmark = bookmark;
  }

  get properties() {
    return ["url", "title"];
  }

  get id() {
    return `bookmark-${this._bookmark.id}`;
  }

  get url() {
    return this._bookmark.url;
  }

  get title() {
    return this._bookmark.title;
  }

  get relevance() {
    // Use some combination of type, dateAdded
    return 1;
  }
}

class History extends Item {
  constructor(history) {
    super();
    // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/HistoryItem
    this._history = history;
  }

  get properties() {
    return ["url", "title"];
  }

  get id() {
    return `history-${this._history.id}`;
  }

  get url() {
    return this._history.url;
  }

  get title() {
    return this._history.title;
  }

  get relevance() {
    // Should use a combination of lastVisitTime, visitCount, and typedCount
    return 1;
  }
}

class Tab extends Item {
  constructor(tab, content) {
    super();
    // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
    this._tab = tab;
    this.content = content;
  }

  get properties() {
    if (this.content) {
      return ["url", "title", "content"];
    }
    return ["url", "title"];
  }

  get id() {
    return `tab-${this._tab.id}`;
  }

  get url() {
    return this._tab.url;
  }

  get title() {
    return this._tab.title;
  }

  get relevance() {
    // Should use combination of active, lastAccessed
    return 1;
  }
}
