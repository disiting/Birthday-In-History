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
  $('#js-month').on('change', setDays);
  $('#js-year').on('change', setDays);
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
        `<li><h3><a href="${responseJson.response.docs[i].web_url}" target="_blank">${responseJson.response.docs[i].headline.main}</a></h3>
        <p>${responseJson.response.docs[i].snippet}</p>
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
        `<li><h3>On your birthday in year ${responseJson.events[i].year}</h3>
        <p>${responseJson.events[i].description}</p>
        </li>`
      )};
};


function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    //reset page
    $('#results-articles').empty();
    $('#results-events').empty();
    $('#js-error-message').empty();

    const month = $("#js-month").val();
    const day = $("#js-day").val();
    const year = $("#js-year").val();

    getArticles(month, day, year);
    getEvents(month, day, year);
    watchMenu();
  });
}

// Events/Articles results toggle menu
function watchMenu() {
  
  $("#results-articles").addClass("hidden");
  $("#results-events").addClass("hidden");
  $("#menu").removeClass("hidden");
  $(".menu-button").removeClass("active");


  $('body').on('click', '#menu-articles', function (event) {
    $("#results-events").addClass("hidden");
    $("#results-articles").removeClass("hidden");
    $(".menu-button").removeClass("active");
    $(this).addClass("active");
  });
  
  $('body').on('click', '#menu-events', function (event) {
    $("#results-articles").addClass("hidden");
    $("#results-events").removeClass("hidden");
    $(".menu-button").removeClass("active");
    $(this).addClass("active");
  });
}

function setDays() {
  let month = document.querySelector('#js-month').value;
  let year = document.querySelector('#js-year').value;
  switch (month) {
    case '04':
    case '06':
    case '09':
    case '11':
      limitDaysTo(30);
      break;
    case '02':
      isLeapYear(year) ? limitDaysTo(29) : limitDaysTo(28);
      break;
    default:
      limitDaysTo(31);
  }
}

function limitDaysTo(num) {
  let days = document.querySelector('#js-day'),
      daysOptions = document.querySelectorAll('#js-day option');
  //reset hidden days
  for (let i = 31; i > 28; i--) {
    daysOptions[i].classList.remove("hidden");
  }
  if (num === 31) return;
  //hide days
  for (let i = 31; i > num; i--) {
    daysOptions[i].classList.add("hidden");
  }
  //if selected day is going to be hidden
  //select last day of the month
  if (Number(days.value) > Number(num)) {
    days.value = num;
  }
}

function isLeapYear(yr) {
  return !((yr % 4) || (!(yr % 100) && (yr % 400)));
}

renderDate();
$(watchForm);

// This adds "back to top" button if user scrolls down to view the results
$(window).scroll(function() {
  let height = $(window).scrollTop();
  if (height > 100) {
      $('#totop').fadeIn();
  } else {
      $('#totop').fadeOut();
  }
});

// Event listener for "back to top" button
$(document).ready(function() {
  $("#totop").click(function(event) {
      event.preventDefault();
      $("html, body").animate({ scrollTop: 0 }, "slow");
      return false;
  });

});