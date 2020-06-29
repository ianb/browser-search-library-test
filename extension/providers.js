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
  },

  flexsearch: {
    name: "FlexSearch.js",
    url: "https://github.com/nextapps-de/flexsearch",
  },

  wade: {
    name: "wade",
    url: "https://github.com/kbrsh/wade",
  },

  jssearch: {
    name: "Js Search",
    url: "https://github.com/bvaughn/js-search",
  },

  jsii: {
    name: "JSii",
    url: "https://github.com/aws/jsii",
  },

  lunr: {
    name: "Lunr.js",
    url: "https://github.com/olivernn/lunr.js/",
  },

  elasticlunr: {
    name: "Elasticlunr.js",
    url: "http://elasticlunr.com/",
  },

  bulksearch: {
    name: "BulkSearch",
    url: "https://github.com/nextapps-de/bulksearch",
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
