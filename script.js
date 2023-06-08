
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
var listParentContainer = $('.list-parent');
var listContainer = $('.list-container');
var parentContainer = $('.parent-container');
var listBtn = $('#list');
var searchNav = $('#searchA');
var navElement = $('.nav-element');
var trendSpan = $('.trend');
var detailsContainer = $('.details-container');

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
    movieContainer.empty();
    if (results.length == 0) {
        var details = $('<span>').addClass('text-white text-3xl md:ml-30 md:p-10').html("No movies found");
        movieContainer.append(details);
        return;
    }
    results = sortMoviesByReleaseDate(results);
    console.log(results);
    for (var i = 0; i < results.length; ++i) {
        if (results[i].media_type === "person") {
            continue;
        }
        var poster = $('<img>').attr('src', tmdbPhotosUrl + imageSize + (results[i].poster_path || '')).attr('alt', 'Movie poster').addClass('hover:scale-150 transition-transform duration-300');
        movieContainer.append(poster);
        var details = $('<div>').addClass('bg-gray-800 min-[280px]:min-w-[10rem] md:min-w-[25rem] mr-5 flex-col hover:scale-105 transition-transform duration-300').attr('id', 'details');
        movieContainer.append(details);
        details.attr('data-movie-id', results[i].media_type.substring(0, 1) + results[i].id);
        var name = $('<h1>').html(results[i].title || results[i].name).addClass("text-white md:p-2 min-[280px]:p-0 min-[280px]:text-[0.5rem] md:text-sm font-serif");
        details.append(name);
        var overview = $('<p>').html(results[i].overview.substring(0, 250) + "...").addClass("text-white md:p-2 min-[280px]:p-1 min-[280px]:text-[0.5rem] md:text-xs font-serif min-[280px]:min-h-[5rem] md:min-h-[8rem]");
        details.append(overview);
        var releaseDate = $('<p>').html('Release Date: ' + results[i].release_date).addClass("text-white md:p-1 min-[280px]:p-1 min-[280px]:text-[0.5rem] md:text-xs font-serif");
        details.append(releaseDate);
        var mediaType = $('<p>').html('Media Type: ' + capitalizeFirstLetter(results[i].media_type)).addClass("text-white md:p-1 min-[280px]:p-1 min-[280px]:text-[0.5rem] md:text-xs mb-5 font-serif");
        details.append(mediaType);

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        var buttonContainer = $('<div>').addClass('flex justify-between');
        details.append(buttonContainer);
        if (results[i].id) {
            var addToListIcon = $('<i>').addClass('fas fa-plus text-white min-[280px]:text-sm md:text-2xl pl-3 hover:text-gray-500').attr('id', 'addToListBtn');
            buttonContainer.append(addToListIcon);
            try {
                const key = await getYoutubeVideoKey(results[i].id);
                if (key) {
                    var playButton = $('<div>').addClass('flex ml-2 text-white min-[280px]:text-sm md:text-2xl justify-end mr-2 pr-3 hover:text-gray-500').attr('id', 'playBtn');
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
            if (window.innerWidth < 500) {
                data = data.replace('width="480"', 'width="250"');
                data = data.replace('height="270"', 'height="200"');
            }
            movieContainer.addClass('opacity-60');
            trendingContainer.addClass('opacity-60');
            console.log(data);
            player.html(data);

        })
}
var addToList = function (event) {
    var addListButton = $(event.target);
    var movieId = addListButton.closest('#details').attr('data-movie-id');
    saveToLocalStorage(movieId);
}

var removeFromList = function (event) {
    var removeFromListButton = $(event.target);
    var movieId = removeFromListButton.attr('data-movie-id');
    removeFromLocalStorage(movieId);
    displayListOfMovies();
}

var saveToLocalStorage = function (movieId) {
    var list = JSON.parse(localStorage.getItem('listOfMovies')) || [];
    if (!list.includes(movieId.trim())) {
        list.push(movieId.trim());
    }
    localStorage.setItem('listOfMovies', JSON.stringify(list));
}

var removeFromLocalStorage = function (movieId) {
    var list = JSON.parse(localStorage.getItem('listOfMovies')) || [];
    var newList = [];
    list.forEach(function (element) {
        if (!element.includes(movieId)) {
            newList.push(element);
        }
    });
    localStorage.setItem('listOfMovies', JSON.stringify(newList));
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
        movieContainer.removeClass('opacity-60');
        trendingContainer.removeClass('opacity-60');
    }
    youTubeModal.addClass('hidden');
}

var getTopTrendingMovies = function () {
    trendSpan.html('List Of Trending movies');
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
    trendSpan.html('List Of Top rated TV shows');
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
    console.log("results", results);
    trendingContainer.empty();
    console.log(results);
    for (var i = 0; i < results.length; ++i) {
        var poster = $('<img>').attr('src', tmdbPhotosUrl + imageSize + (results[i].poster_path || '')).attr('alt', 'Movie poster').addClass('w-60 m-4');
        poster.attr('data-overview', results[i].overview);
        poster.attr('data-title', results[i].title);
        trendingContainer.append(poster);
    }
}

var displayOverview = function (event) {
    detailsContainer.empty();
    var poster = $(event.target);
    var posterPosition = poster.offset();
    var overviewLength = poster.attr('data-overview').length;
    var topOffset = overviewLength > 250 ? 180 : 120;
    var topPosition = posterPosition.top - topOffset + 'px';
    var leftPosition = posterPosition.left + window.scrollX + 'px';
    poster.addClass("border border-white");
    detailsContainer.addClass("relative");
    var details = $('<div class="flex w-70 flex-col flex-wrap mt-10 text-white text-2xs bg-gray-800 max-w-xl absolute">');
    details.css({ top: topPosition, left: leftPosition });
    detailsContainer.append(details);
    var titleSpan = $('<span class="p-1">' + poster.attr('data-title') + '</span>');
    details.append(titleSpan);
    var overview = overviewLength > 250 ? poster.attr('data-overview').substring(0, 250) + "..." : poster.attr('data-overview');
    var overviewSpan = $('<span class="p-1">' + overview + '</span>');
    details.append(overviewSpan);
}

var displayListOfMovies = function () {
    listParentContainer.removeClass('hidden');
    parentContainer.addClass('hidden');
    listContainer.empty();
    var moviesListLS = JSON.parse(localStorage.getItem('listOfMovies')) || [];
    if (moviesListLS.length === 0) {
        var lst = $('<div>').html('No movies in your list').addClass('mt-200 text-white text-5xl');
        listContainer.append(lst);
        return;
    }
    $.each(moviesListLS, function (index, movieId) {
        var type = movieId.substring(0, 1);
        var mediaType = type.toUpperCase() === 'M' ? 'movie' : 'tv';
        var tmdbMovieDetailsEndpoint = tmdbBaseUrl + "/" + mediaType + "/{movie_id}";
        tmdbMovieDetailsEndpoint = tmdbMovieDetailsEndpoint.replace("{movie_id}", movieId.substring(1));
        fetch(tmdbMovieDetailsEndpoint,
            {
                headers: {
                    'Authorization': `Bearer ${tmdbBearerToken}`,
                    'Accept': 'application/json'
                }
            }).then(response => {
                return response.json();

            })
            .then(data => {
                console.log(data);
                var container = $('<div>').addClass('flex mt-20 p-4');
                listContainer.append(container);
                var removeFromListIcon = $('<i>').addClass('fas fa-minus text-white text-sm md:text-3xl md:pl-3 mr-2 md:mr-8 hover:text-gray-500').attr('id', 'removeFromListBtn');
                removeFromListIcon.attr('data-movie-id', data.id);
                container.append(removeFromListIcon);
                var poster = $('<img>').attr('src', tmdbPhotosUrl + imageSize + (data.poster_path || '')).attr('alt', 'Movie poster').addClass('flex-item p-2 border border-red-500') .css('height', '270px');;
                container.append(poster);

            });
    })
}
var hideListContainer = function () {
    listParentContainer.addClass('hidden');
    parentContainer.removeClass('hidden');
}

var resetPoster = function (event) {
    var poster = $(event.target);
    poster.removeClass("border border-white");
    detailsContainer.removeClass("relative");
    detailsContainer.empty();
}

submit.on('click', searchMovies);
movieContainer.on('click', '#playBtn', playTrailer);
youTubeModal.on('click', '#closeBtn', hidePlayer);
topMovies.on('click', getTopTrendingMovies);
topTv.on('click', getTopTv);
movieContainer.on('click', '.fa-plus', addToList);
listContainer.on('click', '.fa-minus', removeFromList);
listBtn.on('click', displayListOfMovies);
navElement.on('click', hideListContainer);
trendingContainer.on('mouseenter', 'img', displayOverview);
trendingContainer.on('mouseleave', 'img', resetPoster);
