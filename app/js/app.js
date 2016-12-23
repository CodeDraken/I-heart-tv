
// load the static site
$(document).ready(function() {

  // get 6 now playing movies and popular TV shows and insert them
  // generate HTML posts from data
  loadMovies();
  loadTV();

  // Clicking on a movie poster
  $('body').on('click', '.post', function() {
    var $this = this;
    changeActivePost($this)
  });

  // clicking on expand arrows
  $('.expandArrow').on('click', function() {
    var $this = this,
      id = $this.id;

    switch (id) {
      case 'prevMovie':
        changeActivePost(postsModule.selectPost('#moviePostRow', postsModule.prevActive('movie')));
        break;
      case 'nextMovie':
        changeActivePost(postsModule.selectPost('#moviePostRow', postsModule.nextActive('movie')));
        break;
      case 'prevTV':
        changeActivePost(postsModule.selectPost('#tvPostRow', postsModule.prevActive('tv')));
        break;
      case 'nextTV':
        changeActivePost(postsModule.selectPost('#tvPostRow', postsModule.nextActive('tv')));
        break;
    }
  });

}); // document ready

// smooth scroll
$('a[href^=\\#]').on('click', function(event) {
  var $root = $('html, body');
  event.preventDefault();
  $($root).animate({ scrollTop: $(this.hash).offset().top }, 500);
});


var postsModule = (function() {
  // not zero index
  var moviePostAmount = 0,
    tvPostAmount = 0,
    activeMovie = 1,
    activeTV = 1;

  return {
    setActive: function(postType, index){
      if (postType == 'movie') {
        activeMovie = index;
      } else {
        activeTV = index;
      }
    },
    nextActive: function(postType) {
      // returns the index of the next post
      if (postType == 'movie') {
        activeMovie++;
        return activeMovie > moviePostAmount ? activeMovie = 1 : activeMovie;
      } else {
        activeTV++;
        return activeTV > tvPostAmount ? activeTV = 1 : activeTV;
      }
    },
    prevActive: function(postType) {
      // returns the index of the previous post
      if (postType == 'movie') {
        activeMovie--;
        return activeMovie < 1 ? activeMovie = moviePostAmount : activeMovie;
      } else {
        activeTV--;
        return activeTV < 1 ? activeTV = tvPostAmount : activeTV;
      }
    },
    setPostAmount: function(postType, amount) {
      // set the amount of posts that are displaying
      postType == 'movie' ? moviePostAmount = amount : tvPostAmount = amount;
    },
    getPostAmount: function(postType) {
      // get the amount of posts that are displaying
      return postType == 'movie' ? moviePostAmount : tvPostAmount;
    },
    selectPost: function(postRow, index) {
      var post = $(postRow + ' .post').eq(index-1)[0];
      return post;
    }
  };


}());


function changeActivePost($this) {
  if ($($this).hasClass('active')) {
    // do nothing
  } else {
    var parentID = $($this).parent().attr('id');
    var expandHolder = parentID == 'moviePostRow' ? '#expandHolder' : '#expandHolderTwo';

    // do transition
    $(expandHolder + ' .post-expand-wrapper').css('opacity', 0);

    // remove all active classes in that row
    $( '#' + parentID + ' .post').removeClass('active');
    // add active class to the clicked poster
    $($this).addClass('active');
    // update the posts module active index number
    postsModule.setActive($this.dataset.postType, Number($this.dataset.indexNum)+1);

    // delayed for transition
    setTimeout(function() {
      // load info in the expanded display
      loadPostInfo($this.dataset.postType, Number($this.dataset.indexNum), expandHolder);
    }, 500)

  }
}

// get 6 posts from a data object and insert them into rowID
function generatePosts(data, rowID, postType) {
  // the resulting HTML row
  var postRow = '';
  var i;

  for (i = 0; i < 6; i++) {
    // each movie / tv show is an object dataPost
    var dataPost = data.results[i];

    if (dataPost == undefined) {
      $(rowID).html(postRow);
      return;
    } else {
      // movies use title tv shows use name
      var title = dataPost.title || dataPost.name;
      // set the first post active for displaying its info
      var isActive = i === 0 ? ' active' : '';
      // 1 movie / tv show poster
      var htmlPost = '<div class="post' + isActive + '" data-index-num="' + i + '" data-post-type="' + postType + '">' +
        '<img class="display-img" src="https://image.tmdb.org/t/p/w150' + dataPost.poster_path + '" alt="missing poster image">' +
        '<h3 class="title">' + title + '</h3>' +
        '</div>';

      // add the post to the row
      postRow += htmlPost;

      // load the expanded the first post
      loadPostInfo(postType, 0);
    } // if
  } // for
  // save the amount of generated posts
  postsModule.setPostAmount(postType, i);
  $(rowID).html(postRow);
};


function loadPostInfo(postType, index, expandHolder) {

  if (postType == 'movie') {
    var postInfo = APIModule.getMovies().results[index];

    $('#expand-title').text(postInfo.title);
    addTrophy(('#expand-trophy-container'), Math.ceil(postInfo.vote_average / 2));
    $('#expand-desc').text(postInfo.overview);
    $('#expand-poster').html('<img src="https://image.tmdb.org/t/p/w300' + postInfo.poster_path + '" alt="">');

    $(expandHolder + ' .post-expand-wrapper').css('opacity', 1);

  } else {
    var postInfo = APIModule.getTV().results[index];

    $('#expand-title-two').text(postInfo.name);
    addTrophy(('#expand-trophy-container-two'), Math.ceil(postInfo.vote_average / 2));
    $('#expand-desc-two').text(postInfo.overview);
    $('#expand-poster-two').html('<img src="https://image.tmdb.org/t/p/w300' + postInfo.poster_path + '" alt="">');

    // transition in
    $(expandHolder + ' .post-expand-wrapper').css('opacity', 1);

  }

}


function addTrophy(element, amount) {
  var trophyHTML = '';
  for (var i = 0; i < amount; i++) {
    trophyHTML += '<i class="fa fa-trophy" aria-hidden="true"></i>';
  }
  $(element).html(trophyHTML);
}


function loadMovies() {
  if(APIModule.getMovies()) {
    generatePosts(APIModule.getMovies(), '#moviePostRow', 'movie');
  } else {
    setTimeout(function() {
      console.log('loading movies');
      loadMovies();
    }, 250);
  }
}

function loadTV() {
  if(APIModule.getTV()) {
    generatePosts(APIModule.getTV(), '#tvPostRow', 'tv');
  } else {
    setTimeout(function() {
      console.log('loading tv');
      loadTV();
    }, 250);
  }
}


// module for API access
var APIModule = (function() {
  var movies,
    tv,
   movieSettings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.themoviedb.org/3/movie/now_playing?page=1&language=en-US&api_key=d79aada4e3638b2d2b5b220c070d814d",
    "method": "GET",
    "headers": {},
    "data": "{}"
  },
  tvSettings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.themoviedb.org/3/tv/popular?page=1&language=en-US&api_key=d79aada4e3638b2d2b5b220c070d814d",
    "method": "GET",
    "headers": {},
    "data": "{}"
  };

  $.ajax(movieSettings).done(function (response) {
    movies = response;
  });

  $.ajax(tvSettings).done(function (response) {
    tv = response;
  });

  return {
    getMovies: function() {
      if (movies) return movies;
    },
    getTV: function() {
      if (tv) return tv;
    }
  }

}());


// API INFO

// Get Movies now playing in theaters

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://api.themoviedb.org/3/movie/now_playing?page=1&language=en-US&api_key=d79aada4e3638b2d2b5b220c070d814d",
//   "method": "GET",
//   "headers": {},
//   "data": "{}"
// }

// $.ajax(settings).done(function (response) {
//   console.log(response);
// });


// Get popular TV shows

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://api.themoviedb.org/3/tv/popular?page=1&language=en-US&api_key=d79aada4e3638b2d2b5b220c070d814d",
//   "method": "GET",
//   "headers": {},
//   "data": "{}"
// }
//
// $.ajax(settings).done(function (response) {
//   console.log(response);
// });


// IMAGES
// https://image.tmdb.org/t/p/w500/xxx.jpg
