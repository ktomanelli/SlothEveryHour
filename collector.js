require('dotenv').config();

const gis = require('g-i-s');

function collectSloths() {
  return new Promise((resolve, reject) =>
    gis('sloth', (err, res) => {
      if (err) reject(err);
      return resolve(res);
    })
  );
}

async function start() {
  const sloths = await collectSloths();
  console.log(sloths);
}

start();
