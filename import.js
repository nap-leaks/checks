const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const csv = require('csvtojson')

const getFilePaths = require('./helpers/file');

const files = getFilePaths(process.env.minfinPATH, ['csv']);

var db = null,
    client = null;

// Use connect method to connect to the server
MongoClient.connect(process.env.mongoURL, function (err, _client) {
  assert.equal(null, err);
  client = _client;
  db = client.db(process.env.dbName);

  processor(0);
});

var getName = (index) => {
  var parts = files[index].split('/');
  var name = parts[parts.length - 2] + '-' + parts[parts.length - 1];
  return name.replace('.csv', '').split('$').join('_DOLAR_');
}
var processor = (index) => {
  index = index || 0;
  var timeout = null;
  var objects = [];
  var length = 0;
  csv({
    nullObject:false
  })
    .fromFile(files[index])
    .subscribe((jsonObj) => {
      length++;
      var props = Object.getOwnPropertyNames(jsonObj);
      for(var a in props){
        if(jsonObj[props[a]] == 'NULL'){
          delete jsonObj[props[a]];
        }
        if(props[a].includes('$')){
          jsonObj[props[a].replace('$', '_DOLAR_')] = jsonObj[props[a]];
          delete jsonObj[props[a]];
        }
      }
      objects.push(jsonObj);
      
      if(timeout){
        clearTimeout(timeout);
      }
      timeout = setTimeout(()=> {
        timeout = null;
        insertFiles(getName(index), objects)
        .then(()=>{
          console.log('Finished ' + getName(index), 'Wrote: ' + length);
          if (index < files.length - 1){
            processor(index + 1);
          }
          else{
            console.log('Waiting to close.......')
            client.close();
          }
        })
      }, 2500);
    });
}

var insertFiles = (name, jsonObjs) => {
  return new Promise((resolve, reject) => {
    db.collection(name).insertMany(jsonObjs, function (error, response) {
      if(error)
        return reject(error);
        
      resolve(jsonObjs);
    });
  })
}

process.on('beforeExit', () => {
  console.log('exiting')
})