browser.runtime.onMessage.addListener(() => {
  return Promise.resolve(document.body.innerText);
});
