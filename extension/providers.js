/* globals Fuse, FlexSearch, Wade, JsSearch, lunr, BulkSearch */

export const providers = {
  string: {
    name: "String search",
    url: "#",
    async search(term, { items }) {
      const result = [];
      for (const item of items) {
        if (item.indexed.includes(term)) {
          result.push({
            item,
            info: {},
          });
        }
      }
      return result;
    },
  },

  fuse: {
    name: "Fuse.js",
    url: "https://fusejs.io/",
    async search(term, { items }) {
      const fuse = new Fuse(items, {
        keys: ["indexed"],
        includeScore: true,
        shouldSort: true,
      });
      const results = fuse.search(term);
      return results.map((info) => {
        const item = info.item;
        delete info.item;
        return {
          item,
          info,
        };
      });
    },
  },

  flexsearch: {
    name: "FlexSearch.js",
    url: "https://github.com/nextapps-de/flexsearch",
    async search(term, { items, itemsById }) {
      const index = new FlexSearch();
      for (const item of items) {
        index.add(item.id, item.indexed);
      }
      const results = index.search(term);
      return results.map((id) => {
        if (!itemsById.get(id)) {
          throw new Error(`Bad item id ${id}`);
        }
        return {
          item: itemsById.get(id),
          info: {},
        };
      });
    },
  },

  wade: {
    name: "wade",
    url: "https://github.com/kbrsh/wade",
    async search(term, { items }) {
      const texts = [];
      for (const item of items) {
        texts.push(item.indexed);
      }
      const search = Wade(texts);
      const results = search(term);
      return results.map((result) => {
        if (!items[result.index]) {
          throw new Error(`Bad item id ${result.index}`);
        }
        return {
          item: items[result.index],
          info: result,
        };
      });
    },
  },

  jssearch: {
    name: "Js Search",
    url: "https://github.com/bvaughn/js-search",
    async search(term, { items }) {
      const search = new JsSearch.Search("id");
      search.addIndex("indexed");
      search.addDocuments(items);
      const results = search.search(term);
      return results.map((r) => {
        if (!r) {
          throw new Error("Bad/empty item");
        }
        return {
          item: r,
          info: {},
        };
      });
    },
  },

  lunr: {
    name: "Lunr.js",
    url: "https://github.com/olivernn/lunr.js/",
    async search(term, { items, itemsById }) {
      const index = lunr(function () {
        this.field("indexed");
        for (const item of items) {
          this.add(item);
        }
      });
      return index.search(term).map((info) => {
        if (!itemsById.get(info.ref)) {
          throw new Error(`No item by id ${info.ref}`);
        }
        return {
          item: itemsById.get(info.ref),
          info,
        };
      });
    },
  },

  bulksearch: {
    name: "BulkSearch",
    url: "https://github.com/nextapps-de/bulksearch",
    async search(term, { items }) {
      const index = new BulkSearch({
        encode: "extra",
        multi: true,
      });
      for (let i = 0; i < items.length; i++) {
        index.add(i, items[i].indexed);
      }
      const results = index.search(term);
      return results.map((index) => {
        if (!items[index]) {
          throw new Error(`No item with index ${index}`);
        }
        return {
          item: items[index],
          info: {},
        };
      });
    },
  },

  /*
  This one needs to be browserify'd before we can use it:
  bm25: {
    name: "BM25",
    url: "https://github.com/chadkirby/wink-bm25-text-search#readme",
  },
  */
};

export async function executeSearch(browserData, term) {
  const results = { collections: {} };
  const totalStartTime = Date.now();
  for (const collection of browserData.collections) {
    results.collections[collection.title] = {};
    for (const name in providers) {
      const provider = providers[name];
      const startTime = Date.now();
      const matches = await provider.search(term, {
        items: collection.items,
        itemsById: collection.itemsById,
      });
      const time = Date.now() - startTime;
      results.collections[collection.title][name] = {
        provider,
        time,
        matches,
      };
    }
  }
  results.totalTime = Date.now() - totalStartTime;
  return results;
}
