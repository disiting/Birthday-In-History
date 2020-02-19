'use strict';

const monthNames = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];

const apiKeyNYT = 'HydbplluI8YvJzxWuTpB6fTdThQ2cywo'; 
const searchURLNYT = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
const searchURLByabbe = 'https://byabbe.se/on-this-day/{month}/{day}/events.json';


function renderDate() {
  for(let i=0; i<monthNames.length; i++) {

    let monthNumber = ("0" + (i+1)).substr(-2,2);
    $('#js-month').append(`
        <option value= "${monthNumber}">${monthNames[i]}</option>
    `);
  }
  for(let i=1; i<=31; i++) {

    let dayNumber = ("0" + (i)).substr(-2,2);
    $('#js-day').append(`
        <option value= "${dayNumber}">${dayNumber}</option>
    `);
  }
  let today = new Date();
  for(let i=today.getFullYear(); i>=1900; i--) {
    $('#js-year').append(`
        <option value="${i}">${i}</option>
    `);
  }
}

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


function getArticles(month, day, year) {
    const params = {
        'api-key' : apiKeyNYT,
        fq: 'pub_date:(' + year + '-' + month + '-' + day + ')'
    };
    const queryString = formatQueryParams(params)
    const url = searchURLNYT + '?' + queryString;

    fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayArticlesResults(responseJson, month, day, year))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayArticlesResults(responseJson, month, day, year) {
    console.log(responseJson);
    $('#results-articles').empty();
    $('#results-articles').append(`<h2>New York Times articles published on ${month}/${day}/${year}:</h2>`);
    $('#results-articles').append(`<ul id="results-articles-list"></ul>`);

    for (let i = 0; i < responseJson.response.docs.length; i++){
      $('#results-articles-list').append(
        `<li><h3>${responseJson.response.docs[i].headline.main}</h3>
        <p>${responseJson.response.docs[i].snippet}</p>
        <a href="${responseJson.response.docs[i].web_url}" target="_blank">${responseJson.response.docs[i].web_url}</a>
        </li>`
      )};
};




function getEvents(month, day, year) {
    let url = searchURLByabbe
    url = url.replace('{month}',parseInt(month));
    url = url.replace('{day}',parseInt(day));

    fetch(url)
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displayEventsResults(responseJson, month, day, year))
      .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });

}

function displayEventsResults(responseJson, month, day, year) {
    console.log(responseJson);
    $('#results-events').empty();
    $('#results-events').append(`<h2>What happened on ${month}/${day} in history:</h2>`);
    $('#results-events').append(`<ul id="results-events-list"></ul>`);
  
    for (let i = 0; i < responseJson.events.length; i++){
      $('#results-events-list').append(
        `<li><h3>${responseJson.events[i].year}</h3>
        <p>${responseJson.events[i].description}</p>
        </li>`
      )};
};


function watchForm() {
  $('form').submit(event => {
    event.preventDefault();

    const month = $("#js-month").val();
    const day = $("#js-day").val();
    const year = $("#js-year").val();

    
    getArticles(month, day, year);
    getEvents(month, day, year);
    watchMenu();
  });
}

function watchMenu() {
  
  $("#results-articles").addClass("hidden");
  $("#results-events").addClass("hidden");
  $("#menu").removeClass("hidden");
  


  $('body').on('click', '#menu-articles', function (event) {
    $("#results-events").addClass("hidden");
    $("#results-articles").removeClass("hidden");
    $(".menu-buttons input").removeClass("active");
    $(this).addClass("active");
  });
  
  $('body').on('click', '#menu-events', function (event) {
    $("#results-articles").addClass("hidden");
    $("#results-events").removeClass("hidden");
    $(".menu-buttons input").removeClass("active");
    $(this).addClass("active");
  });
}





renderDate();
$(watchForm);