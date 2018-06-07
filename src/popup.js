const _ = require('lodash');

document.addEventListener('DOMContentLoaded', () => {
  let randomButton = document.getElementById('getBookmark');
  let controls = document.getElementById('controls');

  hideControls({randomButton, controls});
  // TabID is the id of the tab that opens from the random item. 
  let randomItem,
      currentPageID;
  randomButton.onclick = () => {
    randomButton.style.border = 'none';
    // Grab the current store of bookmarks.
    chrome.storage.local.get('bookmarks', ({bookmarks}) => {
      // Flatten out top level arrays into single array
      bookmarks = _.flatten(bookmarks);
      // Flatten further for any sub directories
      let allBookmarks = flatten(bookmarks, []);
      // Pick a bookmark at random
      randomItem = allBookmarks[getRandom(allBookmarks)];
      console.log(randomItem);
      // Navigate to the random bookmark. 
      chrome.tabs.query({active:true, windowType: "normal", currentWindow: true},function(d){
        // Tab ID is essential for updates to confirm we're checking the 
        // that the correct tab is updating for later processing.
        currentPageID = d[0].id;
        // Go to page
        chrome.tabs.update({url: randomItem.url});
      });
    });
  };

  chrome.tabs.onUpdated.addListener((pageID, changeInfo, tab) => {
    let del = document.getElementById('delete');
    let keep = document.getElementById('keep');
    if(pageID === currentPageID){
      console.log(tab);
     // TODO: Add in function to check if its a valid link and if the user wants to remove it from their bookmarks
      if(tab.status === "complete"){
        controls.style.display = 'inherit';
        del.addEventListener('click', () => {
           deleteBookmark(randomItem);
           updateBookmarksStore();
           hideControls({randomButton, controls});
        });
   
        keep.addEventListener('click', () => {
         hideControls({randomButton, controls});
        });
      }
    }
  })
});

const deleteBookmark = (bookmark) => {
  chrome.bookmarks.search(bookmark.title, function(result) {
    if(result[0]){
      chrome.bookmarks.remove(result[0].id)
    }
  });
}

const hideControls = ({randomButton, controls}) => {
  controls.style.display = 'none';
  randomButton.style.border = 'solid yellow 3px';
}

const updateBookmarksStore = () => {
  chrome.bookmarks.getTree((data) => {
    let bookmarks = [];
    if(data){
      data[0].children.forEach((folder) => {
        bookmarks.push(folder.children)
      })
    }
    chrome.storage.local.set({bookmarks: bookmarks}, () => {
      console.log('Bookmarks Updated', bookmarks);
    });
  });
}

const getRandom = ({length}) => {
  if(length) {
    return Math.floor(Math.random() * length);
  }
}

const flatten = (list, flattenedList) => {
  // Loop through the list, return stuff added onto flattenedList
  _.forEach(list, (element) => {
    // If theres a "children" prop on the element its another folder in the list of bookmarks
    if (isSubdirectory(element)) {
      // If it is a directory. Recursively use this function to flatten the children handling any other folders
      // Returning an array of the objects and tacking it onto the final returned array
      flattenedList = _.concat(flattenedList, flatten(element.children, []));
    } else {
      // If it doesnt have the child prop. Just push it to the final returned Array.
      flattenedList.push(element);
    }
  });
  return flattenedList;
}

function isSubdirectory(e) {
  return e.hasOwnProperty('children');
}