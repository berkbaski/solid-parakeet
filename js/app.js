import SecretKey from '../secretKey.js';

const sampleController = {
    init: function () {
        this.baseUrl = '';
        this.searchInputValue = '';
        this.recentSearches = [];
    },
    onload: function () {
        this.baseUrl = `http://www.omdbapi.com/?apikey=${SecretKey}`;

        this.doms = {
            inputSearchBox: $('#input-search-box'),
            buttonSearch: $('#button-search'),
            recentSearches: $('.recent-search-results'),
            searchResults: $('.search-results'),
            recentSearchesParent: $('.list-group'),
        };
        this.bindActions();
        this.functions.getRecentSearches(this);
    },
    bindActions: function () {
        const _this = this;

        this.doms.inputSearchBox.keyup(function (element) {
            _this.functions.changeSearchInputValue(element, _this);
        });
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
        getMovies: function (_this) {
            $.get(`${_this.baseUrl}&t=${_this.searchInputValue}`, function (data) {
                _this.functions.clearMoviesContent(_this);
                _this.functions.createMovieItem(data, _this.doms.searchResults[0]);
            });
        },
        getRecentSearches: function (_this) {
            $('.list-group-item').remove();
            _this.recentSearches = JSON.parse(localStorage.getItem('recent-searches'));
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
        changeSearchInputValue: function (element, _this) {
            _this.searchInputValue = element.target.value;

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
        createMovieItem: function (movie, parentElement) {
            const columnElement = document.createElement('div');
            columnElement.id = movie.imdbID;
            columnElement.className = 'col-sm-12 col-md-6 col-lg-4 col-xl-3 mb-3 search-results-item';

            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            const favButtonElement = document.createElement('div');
            favButtonElement.className =
                'fav-button d-flex align-items-center justify-content-center';

            const heartElement = document.createElement('i');
            heartElement.className = 'far fa-heart';

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
        },
        checkRecentSearchLimit: function (_this) {
            _this.recentSearches.slice(10, _this.recentSearches.length).forEach(recentSearch => {
                $(`#${recentSearch.id}`).remove()
            })
        }
    },
};

sampleController.init();

$(document).ready(function () {
    sampleController.onload();
});
