const { PythonShell } = require("python-shell");
const fetch = require("node-fetch");
const express = require('express');

const app = express();

// Listen
app.listen(port = 3000, () => {
    console.log(`Server is running on port ${port} Visit http://localhost:${port}`);
});

app.get("/feed", async (req, res) => {
  const baseUrl = "https://cloud.feedly.com";
  const { ACCESS_TOKEN, GOOGLE_ACCOUNT, GOOGLE_APP_TOKEN } = process.env;

  async function requestFeedlyGetApi(accessToken, api) {
    const url = baseUrl + api;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken
    };
    const options = {
      method: "get",
      headers: headers
    };
    const response = await fetch(url, options);

    return response.json();
  }

  async function searchFeedsFeedly(accessToken, text) {
    return await requestFeedlyGetApi(
      accessToken,
      "/v3/search/feeds?query=" + encodeURIComponent(text)
    );
  }

  async function getPersonalCollectionsFeedly(accessToken) {
    return await requestFeedlyGetApi(accessToken, "/v3/collections");
  }

  async function getPersonalStreamsFeedly(accessToken) {
    return await requestFeedlyGetApi(
      accessToken,
      "/v3/streams/contents/?streamId=" +
        "user/707ed9f8-1a1f-4bac-8e76-e64944289b1c/category/global.all" +
        "&unreadOnly=true"
    );
  }

  async function getFeedsFeedly(accessToken, feedId) {
    return await requestFeedlyGetApi(accessToken, `/v3/feeds/${feedId}`);
  }

  async function getEntryFeedly(accessToken, entryId) {
    return await requestFeedlyGetApi(accessToken, `/v3/entries/${entryId}`);
  }

  async function markReadedFeedly(accessToken, readed) {
    const url = baseUrl + "/v3/markers";
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken
    };
    const data = {
      action: "markAsRead",
      type: "entries",
      entryIds: readed
    };
    const options = {
      method: "post",
      headers: headers,
      body: JSON.stringify(data)
    };
    const response = await fetch(url, options);
  }

  const stream = await getPersonalStreamsFeedly(
    ACCESS_TOKEN,
    "feed/http://jser.info/rss"
  );

  const readed = [];

  if (!stream.errorCode) {
    for (let item of stream.items) {
      PythonShell.runString(
        `import gkeepapi
          
keep = gkeepapi.Keep();
success = keep.login('${GOOGLE_ACCOUNT}', '${GOOGLE_APP_TOKEN}');
          
readlater = keep.findLabel('todo');

note = keep.createNote('${item.originId}');
note.labels = readlater;
keep.sync()
          `,
        null,
        function(err) {
          if (err) throw err;
          readed.push(item.id);
        }
      );
    }
  }

  if (readed.length > 0) {
    markReadedFeedly(ACCESS_TOKEN, readed);
  }

  res.send(stream);
});
