function myFunction() {
  const options = {
    'method': 'get',
    'contentType': 'application/json',
  };
  
  const response = UrlFetchApp.fetch('https://finder-api.now.sh/feed', options);
}