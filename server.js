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

const PORT = process.env.PORT || 3000 

// Initialize Express
const app = express()


// Logs requests made
app.use(logger("dev"))

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }))
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"))

let MONGODB_URI = process.env.MONGODB_URI || "mongodb://admin:admin1@ds243501.mlab.com:43501/heroku_c4xx729h"
mongoose.Promise = Promise
mongoose.connect(MONGODB_URI)

// Routes

// Scrapes the webpage and stores the data in a document of the articles collection.
app.get("/scrape", function(req, res) {

  db.Article.find({})
  .then((scrapedArticles) => {

    let savedTitles = scrapedArticles.map(article => article.title)

    // Grabs the body of the html page
    axios.get("https://electrek.co/guides/tesla/").then(function(response) {

      // Stored in a Cheerio variable
      let $ = cheerio.load(response.data)
      // Saves an empty result array
      let newResults = []

      // Grabs every article
      $("article").each(function(i, element) {
        // Pulls the title, link, and summary from the page and stores in an object
        let newArticle = new db.Article({
          title: $(this).find('h1.post-title').find('a').text().trim(),
          link: $(this).find("a").attr("href"),
          summary: $(this).find("div.elastic-container").find("div.post-body").find("p").text().trim()
        })
        
        console.log(newArticle)
        if (newArticle.title) {
          console.log("new article TITLE ////////////////////  " + newArticle.title)
          if (!savedTitles.includes(newArticle.title)) {
            newResults.push(newArticle)
          }
        }
    })

        db.Article.create(newResults)
        .then(function(x) {
          // View the added result in the console
          console.log(x)
        })
        .catch(function(err) {
          return res.json(err)
        })

      // Informs client side of succesful scrape
      res.send("Scrape Complete")
      })

  })
})


// Grabs all articles from the database
app.get("/articles", function(req, res) {

  // Grab every document in the Articles collection
  db.Article.find({saved: false})
    .then(function(x) {
      // Sends articles back to client
      res.json(x)
    })
    .catch(function(err) {
      res.json(err)
    })
})

// Grabs all of the saved articles from the database
app.get("/savedarticles", function(req, res) {
  console.log("server side /articles hit")
  // Grab every document in the Articles collection
  db.Article.find({saved: true})
    .then(function(x) {
      // Sends articles back to client
      res.json(x)
    })
    .catch(function(err) {
      res.json(err)
    })
})

// Grabs all of the saved articles from the database
app.get("/loadedarticles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved: false})
    .then(function(x) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(x)
    })
    .catch(function(err) {
      res.json(err)
    })
})


// Grabs a specific articles from the db and updates the note property on it
app.get("/articles/:id", function(req, res) {
  
  db.Article.findOne({ _id: req.params.id })
    // add the note(s) to it
    .populate("note")
    .then(function(x) {
      res.json(x)
    })
    .catch(function(err) {
      res.json(err)
    })
})

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
    })
    .then(function(x) {
      res.json(x)
    })
    .catch(function(err) {
      res.json(err)
    })
})


// Route for updating an article to saved / unsaved
app.post("/save/:id", function(req, res) {

  db.Article.findOneAndUpdate({ _id: req.params.id }, {saved: req.body.saved}, { new: true })
    .then(function(x) {
      res.json(x)
    })
    .catch(function(err) {
      res.json(err)
    })
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!")
})



