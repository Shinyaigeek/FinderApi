function myFunction() {
  const options = {
    'method': 'get',
    'contentType': 'application/json',
  };
  
  const response = UrlFetchApp.fetch('YOUR API', options);
}