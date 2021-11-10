/**
 * Norton 2021 - nortonQuiz App
 */

'use strict';

var express     = require('express');
var session     = require('express-session');
var bodyParser  = require('body-parser');
var cors        = require('cors');
var fs          = require('fs');
var multer      = require('multer');

var auth              = require('./auth.js');
var apiRoutes         = require('./routes/api.js');
var apiReactRoutes    = require('./routes/apiReact.js');
var hbsHelpers        = require('./public/handlebarsHelpers.js')
var helmet            = require('helmet');
var passport          = require('passport');
var hbs               = require('express-hbs');

const mongoose          = require('mongoose');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// require and use "multer"...
var upload = multer({ storage: storage });


// For unit and functional testing with Chai later:
// var expect            = require('chai').expect;
// var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

const database = require('./database.js');
const app = express();

database(mongoose, (db) => {

  app.use(helmet.frameguard({ action: 'sameorigin' }));
  app.use(helmet.dnsPrefetchControl({ allow: false }));
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
  
  app.use('/public', express.static(process.cwd() + '/public'));
  app.use('/viewScripts', express.static(process.cwd() + '/viewScripts'));
  
  app.use(cors({origin: '*'})); //For FCC testing purposes only
  
  hbsHelpers(hbs);

  app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
  }));
  
  app.set("view engine", "hbs");
  app.set('views', __dirname + '/views');
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  //For FCC testing purposes
  // fccTestingRoutes(app);
  
  auth(app, db.models.User);
  
  // apiRoutes(app, db, upload);

  apiReactRoutes(app, db, upload);

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
  
  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          var error = e;
            console.log('Tests are not valid:');
            console.log(error);
        }
      }, 1500);
    }
  });
})

module.exports = app; //for testing
