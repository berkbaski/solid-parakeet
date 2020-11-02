import SecretKey from '../secretKey.js';

const sampleController = {
  init: function () {
    this.baseUrl = '';
    this.searchInputValue = '';
    this.movies = [];
  },
  onload: function () {
    this.baseUrl = `http://www.omdbapi.com/?apikey=${SecretKey}&t=godfather`;

    this.doms = {
      inputSearchBox: $('#input-search-box'),
      buttonSearch: $('#button-search'),
      recentSearches: $('.recent-search-results'),
    };
    this.bindActions();
  },
  bindActions: function () {
    const _this = this;

    this.doms.inputSearchBox.keyup(function (element) {
      _this.functions.changeSearchInputValue(element, _this);
    });
    this.doms.inputSearchBox.focus(function () {
      _this.functions.changeRecentSearchVisible(true, _this);
    });
    this.doms.inputSearchBox.blur(function () {
      _this.functions.changeRecentSearchVisible(false, _this);
    });
    this.doms.buttonSearch.click(function () {
      _this.functions.getMovies(_this);
    });
  },
  functions: {
    getMovies: function (_this) {
      $.get(_this.baseUrl, function (data) {
        console.log(data);
      });
    },
    changeSearchInputValue: function (element, _this) {
      this.searchInputValue = element.target.value;

      if (this.searchInputValue.length > 2) {
        _this.doms.buttonSearch.prop('disabled', false);
      } else {
        _this.doms.buttonSearch.prop('disabled', true);
      }
    },
    changeRecentSearchVisible(visible, _this) {
      if (visible) {
        _this.doms.recentSearches.removeClass('d-none');
      } else {
        _this.doms.recentSearches.addClass('d-none');
      }
    },
    createMovieItem(movie) {},
  },
};

sampleController.init();

$(document).ready(function () {
  console.log(sampleController);
  sampleController.onload();
});
