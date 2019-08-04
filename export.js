const collectionName = 'REG_DATA-TR17_EMAIL_ADDRESSES';

const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var sha256 = require('js-sha256');

var db = null,
    client = null;

// Use connect method to connect to the server
MongoClient.connect(process.env.mongoURL, function (err, _client) {
  assert.equal(null, err);
  client = _client;
  db = client.db(process.env.dbName);

  processor();
});

var processor = (index) => {
  getEmails()
  .then((documents) => {
    var json = JSON.stringify(documents);
    fs.writeFileSync('./www/db.json', json);
    client.close();
  })
}

var getEmails = (index) => {
  return new Promise((resolve, reject) => {
    db.collection(collectionName)
    .find({
      'CR17_EMAIL' : {
        $exists: true,
        $ne: null
      }
    })
    .project({
      CR17_EMAIL:1,
      _id:0
    })
    .limit(600000)
    .toArray(function (error, response) {
      if(error)
        return reject(error);
        
      resolve(response.map(x => sha256(x.CR17_EMAIL)));
    });
  })
}

process.on('beforeExit', () => {
  console.log('exiting')
})