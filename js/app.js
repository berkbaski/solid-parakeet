import SecretKey from '../secretKey.js';

const sampleController = {
    init: function () {
        this.baseUrl = '';
        this.searchInputValue = '';
        this.recentSearches = [];
        this.staticTexts = [
            { query: '.search-button', text: 'Search' },
            { query: '.search-header', text: 'Search Results' },
            { query: '.favorite-header', text: 'Favorites' },
        ]
    },
    onload: function () {
        this.baseUrl = `http://www.omdbapi.com/?apikey=${SecretKey}`;

        this.doms = {
            inputSearchBox: $('#input-search-box'),
            buttonSearch: $('#button-search'),
            recentSearches: $('.recent-search-results'),
            searchResults: $('.search-results'),
            recentSearchesParent: $('.list-group'),
            favoriteMovies: $('.favorite-movies')
        };
        this.bindActions();
        this.functions.getRecentSearches(this);
        this.functions.getFavoriteMoviesFromLocalStorage(this);
        this.functions.initStaticTexts(this);
    },
    bindActions: function () {
        const _this = this;

        this.doms.inputSearchBox.keyup(function () {
            _this.functions.changeSearchInputValue(_this);
        });
        this.doms.inputSearchBox.bind('keypress', function (e) {
            if (e.keyCode == 13) {
                _this.functions.addWordToRecentSearch(_this);
                _this.functions.getMovies(_this);
                $(_this.doms.inputSearchBox).blur();
            }
        })
        this.doms.inputSearchBox.focus(function () {
            _this.functions.changeRecentSearchVisible(true, _this);
        });
        this.doms.inputSearchBox.blur(function (element) {
            setTimeout(() => {
                _this.functions.changeRecentSearchVisible(false, _this);
            }, 250)
        });
        this.doms.buttonSearch.click(function () {
            _this.functions.addWordToRecentSearch(_this);
            _this.functions.getMovies(_this);
        });
    },
    functions: {
        initStaticTexts: function (_this) {
            _this.staticTexts.forEach(x => {
                $(x.query).text(x.text);
            })
        },
        getMovies: function (_this) {
            $.get(`${_this.baseUrl}&t=${_this.searchInputValue}`, function (data) {
                if (data.Error) {
                    alert(data.Error);
                } else {
                    _this.functions.clearMoviesContent(_this);
                    _this.functions.createMovieItem(data, _this.doms.searchResults[0], 'search-results-item', _this);
                }
            });
        },
        getRecentSearches: function (_this) {
            $('.list-group-item').remove();
            _this.recentSearches = JSON.parse(localStorage.getItem('recent-searches')) || [];
            _this.recentSearches.forEach(recentSearch => {
                _this.functions.createRecentSearchItem(recentSearch, _this);
            })
        },
        addWordToRecentSearch: function (_this) {
            const newRecentSearch = {id: new Date().getTime(), value: _this.searchInputValue}
            _this.recentSearches.unshift(newRecentSearch);
            _this.functions.createRecentSearchItem(newRecentSearch, _this);

            localStorage.setItem('recent-searches', JSON.stringify(_this.recentSearches));
        },
        changeSearchInputValue: function (_this) {
            _this.searchInputValue = $(_this.doms.inputSearchBox).val();

            if (_this.searchInputValue.length > 2) {
                _this.doms.buttonSearch.prop('disabled', false);
            } else {
                _this.doms.buttonSearch.prop('disabled', true);
            }
        },
        changeRecentSearchVisible: function (visible, _this) {
            if (visible) {
                _this.doms.recentSearches.removeClass('d-none');
            } else {
                _this.doms.recentSearches.addClass('d-none');
            }
        },
        clearMoviesContent: function (_this) {
            $('.search-results-item').remove();
        },
        createMovieItem: function (movie, parentElement, extraClass, _this) {
            const columnElement = document.createElement('div');
            columnElement.id = movie.imdbID;
            columnElement.className = `col-sm-12 col-md-6 col-lg-4 col-xl-3 mb-3 ${extraClass}`;

            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            const favButtonElement = document.createElement('div');
            favButtonElement.className =
                'fav-button d-flex align-items-center justify-content-center';

            const heartElement = document.createElement('i');
            const isFavorite = _this.functions.isFavorite(movie.imdbID, _this);
            heartElement.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';

            favButtonElement.addEventListener('click', function () {
                _this.functions.toggleFavorite(movie, heartElement, _this);
            });

            const imgElement = document.createElement('img');
            imgElement.className = 'card-img-top';
            imgElement.src = movie.Poster;
            imgElement.alt = movie.Title;

            const cardBodyElement = document.createElement('div');
            cardBodyElement.className = 'card-body';

            const cardTitleElement = document.createElement('h5');
            cardTitleElement.className = 'card-title';
            cardTitleElement.innerText = `${movie.Title} | ${movie.Released}`;

            const cardRatings = document.createElement('div');
            cardRatings.className = 'card-ratings';

            const ratingsElement = document.createElement('h5');
            cardRatings.appendChild(ratingsElement);

            if (movie && movie.Ratings) {
                movie.Ratings.forEach(rating => {
                    const ratingElement = document.createElement('div');
                    ratingElement.className =
                        'd-flex w-100 align-items-center justify-content-between rating';

                    const ratingHeaderElement = document.createElement('b');
                    ratingHeaderElement.innerText = rating.Source;

                    const ratingValueElement = document.createElement('p');
                    ratingValueElement.className = 'm-0 ml-1';
                    ratingValueElement.innerText = rating.Value;

                    ratingElement.appendChild(ratingHeaderElement);
                    ratingElement.appendChild(ratingValueElement);

                    cardRatings.appendChild(ratingElement);
                })
            }

            cardBodyElement.appendChild(cardTitleElement);
            cardBodyElement.appendChild(cardRatings);

            favButtonElement.appendChild(heartElement);

            cardElement.appendChild(favButtonElement);
            cardElement.appendChild(imgElement);
            cardElement.appendChild(cardBodyElement);

            columnElement.appendChild(cardElement);

            parentElement.appendChild(columnElement)
        },
        createRecentSearchItem: function (recentSearch, _this) {
            const deleteButtonElement = document.createElement('button')
            deleteButtonElement.className = 'delete-button';

            deleteButtonElement.addEventListener('click', function () {
                _this.functions.deleteRecentSearchItem(recentSearch, _this);
            })

            const trashIconElement = document.createElement('i');
            trashIconElement.className = 'far fa-trash-alt'

            const recentSearchTextElement = document.createElement('p');
            recentSearchTextElement.className = 'w-100 mb-0';
            recentSearchTextElement.innerText = recentSearch.value;

            const recentSearchItemElement = document.createElement('li');
            recentSearchItemElement.id = recentSearch.id;
            recentSearchItemElement.className = 'list-group-item d-flex align-items-center justify-content-between';

            recentSearchItemElement.addEventListener('click', function () {
                _this.functions.chooseRecentSearch(recentSearch, _this);
            })

            deleteButtonElement.appendChild(trashIconElement);
            recentSearchItemElement.appendChild(recentSearchTextElement);
            recentSearchItemElement.appendChild(deleteButtonElement);

            const recentSearchesParent = _this.doms.recentSearchesParent[0];
            recentSearchesParent.insertBefore(recentSearchItemElement, recentSearchesParent.firstChild);
            _this.functions.checkRecentSearchLimit(_this);
        },
        deleteRecentSearchItem: function (recentSearch, _this) {
            const index = _this.recentSearches.indexOf(recentSearch);
            if (index > -1) {
                _this.recentSearches.splice(index, 1);
                localStorage.setItem('recent-searches', JSON.stringify(_this.recentSearches))
                _this.functions.getRecentSearches(_this);
                $(`#${recentSearch.id}`).remove()
            }
        },
        chooseRecentSearch: function (recentSearch, _this) {
            $(_this.doms.inputSearchBox).val(recentSearch.value);
            _this.searchInputValue = recentSearch.value;
            _this.functions.getMovies(_this);
            _this.functions.changeRecentSearchVisible(false, _this);
            _this.functions.changeSearchInputValue(_this);
        },
        checkRecentSearchLimit: function (_this) {
            _this.recentSearches.slice(10, _this.recentSearches.length).forEach(recentSearch => {
                $(`#${recentSearch.id}`).remove()
            })
        },
        toggleFavorite: function (movie, heartElement, _this) {
            const isFavorite = _this.functions.isFavorite(movie.imdbID, _this)
            if (isFavorite) {
                _this.functions.removeMovieFromFavorites(movie.imdbID, _this);
                heartElement.className = 'far fa-heart'
            } else {
                _this.functions.addMovieToFavorites(movie, _this);
                heartElement.className = 'fas fa-heart'
            }
        },
        isFavorite: function (imdbID, _this) {
            return !!_this.functions.getMovieFromFavorites(imdbID, _this);
        },
        addMovieToFavorites: function (movie, _this) {
            const favoriteMovies = _this.functions.getMoviesFromFavorites();
            favoriteMovies.push(movie);
            _this.functions.updateFavoriteMovies(favoriteMovies);
            _this.functions.getFavoriteMoviesFromLocalStorage(_this);
        },
        getMoviesFromFavorites: function () {
            return JSON.parse(localStorage.getItem('favorite-movies')) || [];
        },
        getMovieFromFavorites: function (imdbID, _this) {
            const favoriteMovies = _this.functions.getMoviesFromFavorites();
            return favoriteMovies.find(x => x.imdbID == imdbID);
        },
        removeMovieFromFavorites: function (imdbID, _this) {
            const favoriteMovies = _this.functions.getMoviesFromFavorites();
            const favoriteMovie = favoriteMovies.find(x => x.imdbID == imdbID);
            const index = favoriteMovies.indexOf(favoriteMovie);
            if (index > -1) {
                favoriteMovies.splice(index, 1);
            }

            _this.functions.updateFavoriteMovies(favoriteMovies);
        },
        updateFavoriteMovies: function (movies) {
            localStorage.setItem('favorite-movies', JSON.stringify(movies));
        },
        getFavoriteMoviesFromLocalStorage: function (_this) {
            $('.favorite-movie-item').remove();

            const favoriteMovies = _this.functions.getMoviesFromFavorites();
            favoriteMovies.forEach(favoriteMovie => {
                _this.functions.createMovieItem(favoriteMovie, _this.doms.favoriteMovies[0], 'favorite-movie-item', _this);
            })
        }
    },
};

sampleController.init();

$(document).ready(function () {
    sampleController.onload();
});
