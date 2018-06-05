chrome.runtime.onInstalled.addListener(function() {
  chrome.bookmarks.getTree(((data) => {
    let bookmarks = [];
    if(data){
      data[0].children.forEach((bookmarkGroups) => {
        bookmarkGroups.children.forEach((bookmark) => {
          bookmarks.push({title: bookmark.title, url: bookmark.url});
        });
      });
    }

    chrome.storage.local.set({bookmarks: bookmarks}, () => {
      console.log('Storage set');
    });
  }));

  chrome.declarativeContent.onPageChanged.removeRules();
});