
const tmdbBaseUrl = "https://api.themoviedb.org/3";
const youtubeBaseUrl = "https://www.googleapis.com/youtube/v3";
const youtubeKey = "";
const tmdbBearerToken = "";
const tmdbPhotosUrl = 'https://image.tmdb.org/t/p/';
var tmdbVideoEndpoint = tmdbBaseUrl + "/movie/{movie_id}/videos";
var youTubeVideoEndpoint = youtubeBaseUrl + "/videos?id={movie_id}&key={key}}&part=player";
const imageSize = 'w300';
const movieId = 502356;
const movieKey = "8rHNp7cPUb0";

var submit = $('#submit');
var play = $('#play');
var searchInput = $('#search');
var movieContainer = $('.movie-container');
var youTubeModal = $('#youTubeModal');

var searchMovies = function (event) {
    event.preventDefault();
    var searchedTxt = searchInput.val().trim();
    var tmdbSearchEndpoint = tmdbBaseUrl + "/search/multi";
    fetch(tmdbSearchEndpoint + '?query=' + searchedTxt + '&page=1&language=en-US',
        {
            headers: {
                'Authorization': `Bearer ${tmdbBearerToken}`,
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Request failed.');
            }
        })
        .then(data => {
            displayMoviesDetails(data.results);
        });
}


var displayMoviesDetails = function (results) {
    if (results.length == 0) {
        alert('No search results returned');
        return;
    }
    results = sortMoviesByReleaseDate(results);
    console.log(results);
    movieContainer.empty();
    for (var i = 0; i < results.length; ++i) {
        var poster = $('<img>').attr('src', tmdbPhotosUrl + imageSize + (results[i].poster_path || '')).attr('alt', 'Movie poster').addClass('w-72');
        movieContainer.append(poster);
        var details = $('<div>').addClass('bg-gray-800 min-w-[20rem] mr-5 flex-col')
        movieContainer.append(details);
        var name = $('<h1>').html(results[i].title || results[i].name).addClass("text-white p-3 text-2xl font-serif");
        details.append(name);
        /**
         * To add add more fields like overview,rating..
         * 
         */
        var buttonContainer = $('<div>');
        details.append(buttonContainer);
        var playButton = $('<div>').addClass('ml-2 text-white text-4xl').attr('id', 'playBtn');
        var playIcon = $('<i>').addClass('playIcon fas fa-play');
        playButton.append(playIcon);
        buttonContainer.append(playButton);
    }
}

var sortMoviesByReleaseDate = function (movies) {
    return movies.sort((a, b) => {
        var releaseDtA = a.release_date || a.first_air_date || '1900-01-01';
        var releaseDtB = b.release_date || b.first_air_date || '1900-01-01';
        return dayjs(releaseDtB) - dayjs(releaseDtA);
    });

}

var playTrailer = function (event) {
    event.preventDefault();
    youTubeModal.removeClass('hidden');
    var videoContainer = $('.video-container');
    videoContainer.empty();
   /* fetch(youTubeAPI).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Request failed.');
        }
    })
        .then(data => {
            // Process the data
            return (console.log(data.items[0].player.embedHtml));
        }).then(data => {
            var player = $('<div>');
            videoContainer.append(player);
            player.html(data);

        })*/
        var player = $('<div>').attr('id', player);
        videoContainer.append(player);
        player.html('<iframe width="680" height="760" src="//www.youtube.com/embed/SCBJJG_Ncl0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>');
    //   $('.movie-container').html('<iframe width="480" height="270" src="//www.youtube.com/embed/SCBJJG_Ncl0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>');
}
var hidePlayer = function () {
    var player = $('#player');
    if(player.length > 0){
        player.remove();
    }
    youTubeModal.addClass('hidden');
}
submit.on('click', searchMovies);
movieContainer.on('click', '#playBtn', playTrailer);
youTubeModal.on('click', '#closeBtn', hidePlayer);
