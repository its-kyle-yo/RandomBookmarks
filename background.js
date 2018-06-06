chrome.runtime.onStartup.addListener(function() {
  chrome.bookmarks.getTree((data) => {
    let bookmarks = [];
    if(data){
      data[0].children.forEach((folder) => {
        bookmarks.push(folder.children)
      })
    }
    chrome.storage.local.set({bookmarks: bookmarks}, () => {
      console.log('Storage set', bookmarks);
    });
  });

  chrome.declarativeContent.onPageChanged.removeRules();
});