var elasticsearch = require('elasticsearch');
var fs = require('fs');
const express        = require('express');
const app            = express();
const port = 8000;
var client = new elasticsearch.Client({
  host: 'localhost:9292',
  log: 'trace'
});

app.listen(port, () => {
  console.log('We are live on ' + port);
});

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 3000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});


app.post('/populate', (req, res) => {
  var obj = JSON.parse(fs.readFileSync('realModels.json', 'utf8'))
  var i = 1
  var cars = [];
  obj.forEach(function(model)
  {
    cars.push( {index : { _index: 'cars', _type: 'car', _id: i }})
    cars.push({ doc: model})
    i++
  })
  console.log(cars);


  client.bulk({
    body : cars
  }, function (err, resp) {
  });

  res.send("All is in elasticsearch at the port 9292")

});

app.get('/suv', (req, res) => {
  var tab = [];
  client.search({
  index: 'cars',
  type: 'car',
  body: {
    "sort" : [
  	   {"doc.volume":{"order" : "desc"}}
  	]
}
},function (error, response,status) {
    if (error){
      console.log("search error: "+error)
    }
    else {

      console.log("--- Response ---");
      console.log(response);
      console.log("--- Hits ---");
      response.hits.hits.forEach(function(hit){
          tab.push(hit);
      })
      res.send(tab);
    }
});

});
