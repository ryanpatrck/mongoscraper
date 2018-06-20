// = Requirements ================================================================
const express = require('express')
        app = express()
        bodyParser = require('body-parser')
        logger = require('morgan')
        mongoose = require('mongoose')
        request = require('request')
        cheerio = require('cheerio')

// = Middleware (pass everything through the logger first) ================================================
app.use(logger('dev'))
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public')) // (create a public folder and land there)
    var databaseUri = 'mongodb://localhost/mongoscraper'
    mongoose.connect('mongodb://localhost/mongoscraper')
    if(process.env.MONGODB_URI) {
        mongoose.connect(process.env.MONGODB_URI)
    } else {
        mongoose.connect(databaseUri)
    }
	var db = mongoose.connection;

	db.on('error', function (err) {
		console.log('Mongoose Error: ', err)
	});
	db.once('open', function () {
		console.log('Mongoose connection successful.')
    });
   
    var Note = require('./models/Note.js')
    var Article = require('./models/Article.js')
    
    app.get('/', function(req, res) {
        res.send(index.html); // sending the html file rather than rendering a handlebars file
      });
      app.get('/scrape', function(req, res) {
        request('http://www.screenrant.com/', function(error, response, html) {
          var $ = cheerio.load(html);
          $('.bc-title').each(function(i, element) {
                        console.log(i)
                      var result = {};
      
                      result.title = $(this).children('a').text();
                      result.link = $(this).children('a').attr('href');
      
                      var entry = new Article (result);
      
                      entry.save(function(err, doc) {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log(doc);
                        }
                      });
      
      
          });
        });
        res.send("Scrape Complete");
    });
    
    app.get('/articles', function(req, res){
        Article.find({}, function(err, doc){
            if (err){
                console.log(err);
            } else {
                res.json(doc);
            }
        });
    });

    app.get('/articles/:id', function(req, res){
        Article.findOne({'_id': req.params.id})
        .populate('note')
        .exec(function(err, doc){
            if (err){
                console.log(err);
            } else {
                res.json(doc);
            }
        });
    });
    
    app.post('/articles/:id', function(req, res){
        var newNote = new Note(req.body);
    
        newNote.save(function(err, doc){
            if(err){
                console.log(err);
            } else {
                Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
                .exec(function(err, doc){
                    if (err){
                        console.log(err);
                    } else {
                        res.send(doc);
                    }
                });
    
            }
        });
    });
    
    var port = process.env.PORT || 3008;

    app.listen(port, function() {
        console.log('App running on port 3008!');
      });