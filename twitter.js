require('dotenv').config();
const Twitter = require('twitter');
const axios = require('axios');
const download = require('image-downloader');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_KEY,
});

function sendReplies(first, second) {
  client.post('statuses/update', first).then(tweet => {
    const replyId = tweet.id_str;
    second.in_reply_to_status_id = replyId;
    client.post('statuses/update', second);
  });
}
function sendTweet(imagePath, sloth) {
  // eslint-disable-next-line global-require
  const data = require('fs').readFileSync(imagePath);

  client.post('media/upload', { media: data }, (error, media, response) => {
    if (!error) {
      const status = {
        status: `Photo by ${sloth.creator}`,
        media_ids: media.media_id_string,
      };

      client.post('statuses/update', status, (error, tweet, response) => {
        if (!error) {
          console.log('Sent Tweet.');
          const tweetId = tweet.id_str;
          sendReplies(
            {
              status: `Link to Photographer: ${sloth.creator_url}`,
              in_reply_to_status_id: tweetId,
              username: '@slotheveryhour',
            },
            {
              status: `Photo License: ${sloth.license} => ${sloth.license_url}`,
              in_reply_to_status_id: null,
              username: '@slotheveryhour',
            }
          );
        }
      });
    } else {
      console.log(error);
    }
  });
}

async function getSlothThenTweet(cb) {
  const resp = await axios.get('https://sloth.pics/api');
  const sloth = resp.data;
  const options = {
    url: sloth.url,
    dest: './sloth.jpg',
  };
  download
    .image(options)
    .then(data => {
      cb('./sloth.jpg', sloth);
    })
    .catch(err => console.log(err));
}
// sendTweet('sloth.jpg');

getSlothThenTweet(sendTweet);
setInterval(() => {
  getSlothThenTweet(sendTweet);
}, 3600000);
