// Set up
var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var airport = require('./routes/airport');

// Configuration
mongoose.connect('mongodb://192.168.1.26/flights');  
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

// Models

var Flight = mongoose.model('Flight', {
    flight_number: String,
    airline: {
      name: String,
      code: String,
      imgurl: String
    },
    cities: {
      from: String,
      to: String
    },
    schedule: {
      departure: String,
      arrival: String,
      duration: Number
    },
    price: String,
    segments: [{
      flight_number: String,
      airline: {
        name: String,
        code: String,
        imgurl: String
      },
      cities: {
        from: String,
        to: String
      },
      schedule: {
        departure: String,
        arrival: String,
        duration: Number
      }
    }]
});

app.all('/airports', function(req, res, next) {
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// Routes
app.post('/api/flights', function(req, res) {
    Flight.find({
        cities: {
            from: req.body.from,
            to: req.body.to
        }
    }, function(err, flights){
        if(err){
            res.send(err);
        } else {
            res.json(flights);
        }
    });
});

app.get('/api/listall', function(req, res) {
    Flight.find({}).sort({'schedule.departure':'asc'}).exec(function(err, flights) {
        if (err) {
            res.send(err);
        } else {
            res.json(flights);
        }
    });
});

app.get('/api/removeall', function(req, res) {
    Flight.remove({}, function(res){
        console.log("removed all records");
        res.send("OK");
    });
});

app.post('/api/delitineraries', function(req,res) {
    Flight.remove({ _id: req.body.id }, function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log("Delete an itinerary with doc_id: " +  req.body.id);
            res.send("OK");
        }
    });
});


app.post('/api/additineraries', function(req,res) {
  Flight.find({
      cities: {
          from: req.body.itinerary_origin_place,
          to: req.body.itinerary_destination_place
      }
  }, function (err, data) {
      if (data.length == 0) {
          var newFlight = new Flight(req.body);

        newFlight.save(function(err, doc){
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            console.log("Inserted an itinerary with doc_id: " + doc._id);
            res.send("OK");
          }
        });
      }
  });
});

app.get('/airports', airport.airports);

// listen
app.listen(15789);
console.log("App listening on port 15789");
