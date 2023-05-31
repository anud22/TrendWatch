
const tmdbBaseUrl = "https://api.themoviedb.org/3";
const youtubeBaseUrl = "https://www.googleapis.com/youtube/v3";
const youtubeKey = "AIzaSyCKdcqlaDtj8LmDrda7IVK4e15u8CXRFss";
const tmdbBearerToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTlkYzljM2MzN2ZmM2ZiZTJiN2UxMDQwZDc3NzAwZCIsInN1YiI6IjY0NmQ2MzUwYzM1MTRjMmIwNjg4YjE3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.pr8RBLe8jShCpiIICdlyWgUKrvKJF08Oz_w7MYdECp8";
const tmdbPhotosUrl = 'https://image.tmdb.org/t/p/';
const imageSize = 'w300';
const movieKey = "8rHNp7cPUb0";

var submit = $('#submit');
var play = $('#play');
var searchInput = $('#search');
var movieContainer = $('.movie-container');
var trendingContainer = $('.trending-container');
var youTubeModal = $('#youTubeModal');
var topMovies = $('#movies');
var topTv = $('#tv');
$(document).ready(function () {
    getTopTrendingMovies();
});

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

            return response.json();

        })
        .then(data => {
            displayMoviesDetails(data.results);
        });
}


var displayMoviesDetails = async function (results) {
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
        var details = $('<div>').addClass('bg-gray-800 min-w-[20rem] mr-5 flex-col');
        movieContainer.append(details);
        var name = $('<h1>').html(results[i].title || results[i].name).addClass("text-white p-3 text-l font-serif");
        details.append(name);
        var overview = $('<p>').html(results[i].overview.substring(0, 250) + "...").addClass("text-white p-3 text-xs font-serif");
        details.append(overview);
        var releaseDate = $('<p>').html('Release Date: ' + results[i].release_date).addClass("text-white p-3 text-xs font-serif");
        details.append(releaseDate);
        var mediaType = $('<p>').html(results[i].media_type).addClass("text-white p-3 text-xs font-serif");
        details.append(mediaType);



        var buttonContainer = $('<div>').addClass('place-self-end');
        details.append(buttonContainer);
        if (results[i].id) {
            try {
                const key = await getYoutubeVideoKey(results[i].id);
                if (key) {
                    var playButton = $('<div>').addClass('flex ml-2 text-white text-2xl justify-end mr-2').attr('id', 'playBtn');
                    buttonContainer.append(playButton);
                    var playIcon = $('<i>').addClass('playIcon fas fa-play');
                    playIcon.attr('data-movie-key', key);
                    playButton.append(playIcon);
                }
            } catch (error) {
                console.error("Error fetching YouTube video key:", error);
            }

        }
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
    var videoContainer = $('.video-container');
    var playerContainer = $('#player');
    if (playerContainer.length > 0) {
        playerContainer.empty();
    }
    var playButton = $(event.target);
    var movieId = playButton.attr('data-movie-key');
    var player = $('<div>').attr('id', 'player');
    var youTubeVideoEndpoint = youtubeBaseUrl + "/videos?id={movie_id}&key=" + youtubeKey + "&part=player";
    youTubeVideoEndpoint = youTubeVideoEndpoint.replace("{movie_id}", movieId);
    fetch(youTubeVideoEndpoint).then(response => {
        if (response.ok) {
            youTubeModal.removeClass('hidden');
            videoContainer.append(player);
            return response.json();
        } else {
            throw new Error('Request failed.');
        }
    })
        .then(data => {
            if (!data.items[0]) {
                player.addClass('text-white font-italic p-5');
                player.html("Sorry Something went wrong. This video not present");
                playButton.remove();
            }
            return (data.items[0].player.embedHtml);
        }).then(data => {

            player.html(data);

        })
}

var getYoutubeVideoKey = function (movieId) {
    var tmdbVideoEndpoint = tmdbBaseUrl + "/movie/{movie_id}/videos";
    tmdbVideoEndpoint = tmdbVideoEndpoint.replace("{movie_id}", movieId);
    return fetch(tmdbVideoEndpoint, {
        headers: {
            'Authorization': `Bearer ${tmdbBearerToken}`,
            'Accept': 'application/json'
        }
    }).then(response => response.json())
        .then(data => {
            const results = data.results;
            if (!results || results.length === 0) {
                return null;
            }
            return results[0].key;
        })
        .catch(error => {
            console.error("Error fetching YouTube video key:", error);
            throw error;
        });
}

var hidePlayer = function () {
    var player = $('#player');
    if (player.length > 0) {
        player.remove();
    }
    youTubeModal.addClass('hidden');
}

var getTopTrendingMovies = function () {
    var tmdbTrendingMoviesEndpoint = tmdbBaseUrl + "/trending/movie/day";
    fetch(tmdbTrendingMoviesEndpoint,
        {
            headers: {
                'Authorization': `Bearer ${tmdbBearerToken}`,
                'Accept': 'application/json'
            }
        }).then(response => {
            return response.json();
        })
        .then(data => {
            displayMoviePosters(data.results);
        });
}

var getTopTv = function () {
    var tmdbTopRatedTvEndpoint = tmdbBaseUrl + "/tv/top_rated?language=en-US&page=1";
    fetch(tmdbTopRatedTvEndpoint,
        {
            headers: {
                'Authorization': `Bearer ${tmdbBearerToken}`,
                'Accept': 'application/json'
            }
        }).then(response => {
            return response.json();
        })
        .then(data => {
            displayMoviePosters(data.results);
        });
}

var displayMoviePosters = function (results) {
    trendingContainer.empty();
    console.log(results);
    for (var i = 0; i < results.length; ++i) {
        var poster = $('<img>').attr('src', tmdbPhotosUrl + imageSize + (results[i].poster_path || '')).attr('alt', 'Movie poster').addClass('w-60 m-4');
        trendingContainer.append(poster);
    }
}
submit.on('click', searchMovies);
movieContainer.on('click', '#playBtn', playTrailer);
youTubeModal.on('click', '#closeBtn', hidePlayer);
topMovies.on('click', getTopTrendingMovies);
topTv.on('click', getTopTv);

