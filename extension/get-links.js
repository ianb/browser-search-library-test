(function () {
  if (window.getLinksLoaded) {
    return;
  }
  window.getLinksLoaded = true;
  browser.runtime.onMessage.addListener(() => {
    const links = [];
    for (const el of document.querySelectorAll(
      "a, button, input[type=submit]"
    )) {
      links.push({
        tagName: el.tagName.toLowerCase(),
        url: el.href || null,
        content: el.innerText,
        title: el.getAttribute("title"),
      });
    }
    return Promise.resolve(links);
  });
})();
