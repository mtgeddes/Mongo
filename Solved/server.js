// Dependencies

const express = require("express")
const bodyParser = require("body-parser")
const logger = require("morgan")
const mongoose = require("mongoose")

// Scraping tools
const axios = require("axios")
const cheerio = require("cheerio")

// Mongoose Schemas
const db = require("./models")

const PORT = 3000

// Initialize Express
const app = express()


// Logs requests made
app.use(logger("dev"))

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }))
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"))

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/week18Populater")



// Routes

// Scrapes the webpage and stores the data in a document of the articles collection.
app.get("/scrape", function(req, res) {

  // Grabs the body of the html page
  axios.get("https://electrek.co/guides/tesla/").then(function(response) {

    // Stored in a Cheerio variable
    let $ = cheerio.load(response.data)

    // Grabs every article
    $("article").each(function(i, element) {

      // Saves an empty result object
      let result = {}

      // Pulls the title, link, and summary from the page and stores in an object
      result.title = $(this)
        .find('h1.post-title')
        .find('a')
        .text()
        .trim()
      result.link = $(this)
        .find("a")
        .attr("href");
      result.summary = $(this)
        .find("div.elastic-container")
        .find("div.post-body")
        .find("p")
        .text()
        .trim()
      console.log(result)


    
      // Checks for blank tags and doesn't pull those
      if (result.title == '') {
        console.log('no article found')
      } 
      else {
        db.Article.create(result)
        .then(function(x) {
          // View the added result in the console
          console.log(x)
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err)
        })
      }

    })

    // Informs client side of succesful scrape
    res.send("Scrape Complete")
  })
})



// Grabs all articles from the database
app.get("/articles", function(req, res) {

  // Grab every document in the Articles collection
  db.Article.find({saved: false})
    .then(function(x) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(x);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Grabs all of the saved articles from the database
app.get("/savedarticles", function(req, res) {
  console.log("server side /articles hit")
  // Grab every document in the Articles collection
  db.Article.find({saved: true})
    .then(function(x) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(x);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Grabs all of the saved articles from the database
app.get("/loadedarticles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved: false})
    .then(function(x) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(x);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Grabs a specific articles from the db and updates the note property on it
app.get("/articles/:id", function(req, res) {
  
  db.Article.findOne({ _id: req.params.id })
    // add the note(s) to it
    .populate("note")
    .then(function(x) {
      // Success is sent to client
      res.json(x);
    })
    .catch(function(err) {
      // Error is sent to client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(x) {
      // Success is sent to client
      res.json(x);
    })
    .catch(function(err) {
      // Error is sent to client
      res.json(err);
    });
});


// Route for updating an article to saved / unsaved
app.post("/save/:id", function(req, res) {

  db.Article.findOneAndUpdate({ _id: req.params.id }, {saved: req.body.saved}, { new: true })
    .then(function(x) {
      res.json(x)
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
