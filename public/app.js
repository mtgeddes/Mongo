
// Function to load the scrapped articles
function getArticles() {
  $.getJSON("/articles", function(data) {
    console.log("client side /articles hit")

    for (let i = 0; i < data.length; i++) {

      $("#articles").append("<p data-id='" 
      + data[i]._id + "'>" 
      + data[i].title + "<br />  <br /> " 
      + data[i].link + "<br /> <br /> Summary: " 
      + data[i].summary + "<br /><br /> <br />  </p> <button id='save-article' data-id='" 
      + data[i]._id + "'>Save Article </button>")
    }
  })
}

// Function to load previously scrapped articles not saved
function getLoadedArticles() {
  $('#articles').html('')

  $.getJSON("/loadedarticles", function(data) {
    
    for (let i = 0; i < data.length; i++) {

      $("#articles").append("<p data-id='" 
      + data[i]._id + "'>" 
      + data[i].title + "<br />  <br /> " 
      + data[i].link + "<br /> <br /> Summary: " 
      + data[i].summary + "<br /><br /> <br />  </p> <button id='save-article' data-saved='" 
      + data[i].saved + "' data-id='"
      + data[i]._id + "'>Save Article </button>")
    }
  })
}

// Function to load saved articles
function getSavedArticles() {
  $('#articles').html('')

  $.getJSON("/savedarticles", function(data) {

    for (let i = 0; i < data.length; i++) {

      $("#articles").append("<p data-id='" 
      + data[i]._id + "'>" 
      + data[i].title + "<br />  <br /> " 
      + data[i].link + "<br /> <br /> Summary: " 
      + data[i].summary + "<br /><br /> <br />  </p> <button id='save-article' data-saved='" 
      + data[i].saved + "' data-id='"
      + data[i]._id + "'>Delete Article </button>")
    }
  })
}

// Loads saved articles to browser
$('#saved-articles').on('click', function() {
  getSavedArticles()
})

// Loads previously-loaded articles to browser
$('#loaded-articles').on('click', function() {
  getLoadedArticles()
})

// Starts the web scrapping and loads articles
$('#scrape').on('click', function() {
  console.log('scraped!')
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function() {
    $('#articles').html('')
    getArticles()
  }) 
})

// Pulls up note(s) related to article 
$(document).on("click", "p", function() {

  $("#notes").empty()

  let thisId = $(this).attr("data-id")

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
  .then(function(data) {
    console.log(data)
    
    $("#notes").append("<h2>" + data.title + "</h2>")
    $("#notes").append("<textarea id='bodyinput' name='body'></textarea>")
    $("#notes").append("<button data-id='" + data._id + "' id='save-note'>Save Note</button>")
    $("#notes").append("<button data-id='" + data._id + "' id='clear-note'>Clear Note</button>")

    if (data.note) {
      $("#bodyinput").val(data.note.body)
    }
  })
})

// Saves the notes to the related article
$(document).on("click", "#save-note", function() {

  let thisId = $(this).attr("data-id")

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      body: $("#bodyinput").val()
    }
  })
  .then(function(data) {
    console.log(data)
    $("#notes").empty()
  })

  $("#bodyinput").val("")
})

// Clears the note
$(document).on("click", "#clear-note", function() {

  let thisId = $(this).attr("data-id")

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      body: ''
    }
  })
  .then(function(data) {
    console.log(data)
    $("#notes").empty()
  })

  $("#bodyinput").val("")
})

// Saves the article
$(document).on("click", "#save-article", function() {

  let thisId = $(this).attr("data-id")
  let savedState = $(this).attr('data-saved')

  if (savedState == 'true') {
    savedState = 'false'
  } else if (savedState == 'false') {
    savedState = 'true'
  }

  $.ajax({
    method: "POST",
    url: "/save/" + thisId,
    data: {
      saved: savedState
    }
  })
  .then(function(data) {
    console.log(data)
    $("#notes").empty()
  })

  console.log(savedState)
  if (savedState == 'true') {
    getLoadedArticles()
  } else if (savedState == 'false') {
    getSavedArticles()
  }

  $("#bodyinput").val("")
})