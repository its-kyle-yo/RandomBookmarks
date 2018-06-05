document.addEventListener('DOMContentLoaded', () => {
  let randomButton = document.getElementById('getBookmark');
  let randomItem, tabID;
  randomButton.onclick = () => {
    chrome.storage.local.get('bookmarks', ({bookmarks}) => {
      randomItem = bookmarks[getRandom(bookmarks)];
      console.log(randomItem);
      chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(d){
        tabID = d[0].id; console.log(tabID);
        chrome.tabs.update({url: randomItem.url});
      });
    });
  };

  chrome.tabs.onUpdated.addListener((id) => {
    if(id === tabID){
      let myHeaders = new Headers();
      console.log(myHeaders.getAll());
    }
  })
});

const getRandom = ({length}) => {
  if(length) {
    return Math.floor(Math.random() * length);
  }
}