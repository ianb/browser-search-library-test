/* globals Fuse, FlexSearch, Wade, JsSearch, lunr, elasticlunr, BulkSearch */

export const providers = {
  string: {
    name: "String search",
    url: "#",
    async search(browserData, term) {
      const result = [];
      for (const key in browserData.data) {
        const items = browserData.data[key].items;
        for (const item of items) {
          for (const prop of item.properties) {
            if (item[prop] && item[prop].includes(term)) {
              result.push({
                type: key,
                item,
                info: {},
              });
            }
          }
        }
      }
      return result;
    },
  },

  fuse: {
    name: "Fuse.js",
    url: "https://fusejs.io/",
    async search(browserData, term) {
      const result = [];
      for (const key in browserData.data) {
        const fuse = new Fuse(browserData.data[key].items, {
          keys: browserData.data[key].items[0].properties,
        });
        const r = fuse.search(term);
        for (const item of r) {
          result.push({
            type: key,
            item,
            info: {},
          });
        }
      }
      return result;
    },
  },

  flexsearch: {
    name: "FlexSearch.js",
    url: "https://github.com/nextapps-de/flexsearch",
    async search(browserData, term) {
      const index = new FlexSearch();
      for (const key in browserData.data) {
        for (const item of browserData.data[key].items) {
          index.add(item.id, item.indexed);
        }
      }
      const results = index.search(term);
      return results.map((id) => {
        return {
          // FIXME: set type
          type: null,
          item: browserData.byId.get(id),
          info: {},
        };
      });
    },
  },

  wade: {
    name: "wade",
    url: "https://github.com/kbrsh/wade",
    async search(browserData, term) {
      const items = [];
      const itemIds = [];
      for (const key in browserData.data) {
        for (const item of browserData.data[key].items) {
          items.push(item.indexed);
          itemIds.push(item.id);
        }
      }
      const search = Wade(items);
      const results = search(term);
      return results.map((result) => {
        return {
          key: null,
          item: browserData.byId.get(itemIds[result.index]),
          info: {},
        };
      });
    },
  },

  jssearch: {
    name: "Js Search",
    url: "https://github.com/bvaughn/js-search",
    async search(browserData, term) {
      const items = [];
      for (const key in browserData.data) {
        for (const item of browserData.data[key].items) {
          items.push(item);
        }
      }
      const search = new JsSearch.Search("id");
      search.addIndex("indexed");
      search.addDocuments(items);
      const results = search.search(term);
      return results.map((r) => {
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
    async search(browserData, term) {
      const index = lunr(function () {
        this.field("indexed");
        for (const key in browserData.data) {
          for (const item of browserData.data[key].items) {
            this.add(item);
          }
        }
      });
      return index.search(term).map((info) => {
        return {
          item: browserData.byId.get(info.ref),
          info,
        };
      });
    },
  },

  /*
  // This doesn't seem to be working:
  elasticlunr: {
    name: "Elasticlunr.js",
    url: "http://elasticlunr.com/",
    async search(browserData, term) {
      const index = elasticlunr(function () {
        this.addField("indexed");
        this.setRef("id");
        for (const key in browserData.data) {
          for (const item of browserData.data[key].items) {
            this.addDoc(item.id, item);
          }
        }
      });
      return index.search(term).map((info) => {
        return {
          item: browserData.byId.get(info.ref),
          info,
        };
      });
    },
  },
  */

  bulksearch: {
    name: "BulkSearch",
    url: "https://github.com/nextapps-de/bulksearch",
    async search(browserData, term) {
      const index = new BulkSearch({
        encode: "extra",
        multi: true,
      });
      window.x = index;
      let i = 0;
      const itemIds = [];
      for (const key in browserData.data) {
        for (const item of browserData.data[key].items) {
          index.add(i, item.indexed);
          i++;
          itemIds.push(item.id);
        }
      }
      const results = index.search(term);
      return results.map((index) => {
        return {
          item: browserData.byId.get(itemIds[index]),
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
  const results = {};
  for (const name in providers) {
    const provider = providers[name];
    const startTime = Date.now();
    if (!provider.search) {
      continue;
    }
    const providerResults = await provider.search(browserData, term);
    if (!Array.isArray(providerResults)) {
      throw new Error(
        `Provider ${provider.name} gave bad results: ${typeof providerResults}`
      );
    }
    results[name] = {};
    results[name].provider = provider;
    results[name].time = Date.now() - startTime;
    results[name].items = providerResults;
  }
  return results;
}
