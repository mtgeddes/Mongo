// Grab the articles as a json


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



function getArticles() {
  $.getJSON("/articles", function(data) {
    console.log("client side /articles hit")
    // For each one
    for (let i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" 
      + data[i]._id + "'>" 
      + data[i].title + "<br />  <br /> " 
      + data[i].link + "<br /> <br /> Summary: " 
      + data[i].summary + "<br /><br /> <br />  </p> <button id='save-article' data-id='" 
      + data[i]._id + "'>Save Article </button>");
    }
  });
}


$('#saved-articles').on('click', function() {
  getSavedArticles()
})

$('#loaded-articles').on('click', function() {
  getLoadedArticles()
})

function getLoadedArticles() {
  $('#articles').html('')

  $.getJSON("/loadedarticles", function(data) {
    


    for (let i = 0; i < data.length; i++) {

      // Display the apropos information on the page
      $("#articles").append("<p data-id='" 
      + data[i]._id + "'>" 
      + data[i].title + "<br />  <br /> " 
      + data[i].link + "<br /> <br /> Summary: " 
      + data[i].summary + "<br /><br /> <br />  </p> <button id='save-article' data-saved='" 
      + data[i].saved + "' data-id='"
      + data[i]._id + "'>Delete Article </button>");
    }
  });
}


function getSavedArticles() {
  $('#articles').html('')

  $.getJSON("/savedarticles", function(data) {
    
    // For each one
    for (let i = 0; i < data.length; i++) {

      // Display the apropos information on the page
      $("#articles").append("<p data-id='" 
      + data[i]._id + "'>" 
      + data[i].title + "<br />  <br /> " 
      + data[i].link + "<br /> <br /> Summary: " 
      + data[i].summary + "<br /><br /> <br />  </p> <button id='save-article' data-saved='" 
      + data[i].saved + "' data-id='"
      + data[i]._id + "'>Delete Article </button>")
    }
  });
}

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  let thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='save-note'>Save Note</button>");
      $("#notes").append("<button data-id='" + data._id + "' id='clear-note'>Clear Note</button>")
      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input

        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#save-note", function() {
  // Grab the id associated with the article from the submit button
  let thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {

      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});

$(document).on("click", "#clear-note", function() {
  // Grab the id associated with the article from the submit button
  let thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: ''
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});


$(document).on("click", "#save-article", function() {
  // Grab the id associated with the article from the submit button
  let thisId = $(this).attr("data-id");
  let savedState = $(this).attr('data-saved')

  if (savedState == 'true') {
    savedState = 'false'
  } else if (savedState == 'false') {
    savedState = 'true'
  }

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/save/" + thisId,
    data: {
      // Value taken from note textarea
      saved: savedState
    }
  })
    // With that done
    .then(function(data) {
      // Log the response


      // Empty the notes section
      $("#notes").empty();
    });

    console.log(savedState)
    if (savedState == 'true') {
      getLoadedArticles()
    } else if (savedState == 'false'){
      getSavedArticles()
    }
    
  // Also, remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});