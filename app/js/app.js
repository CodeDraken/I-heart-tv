
// load the static site
$(document).ready(function() {

  // get 6 now playing movies and popular TV shows and insert them
  // generate HTML posts from data
  generatePosts(nowPlayingMovies, '#moviePostRow', 'movie');
  generatePosts(popTV, '#tvPostRow', 'tv');

  // Clicking on a movie poster
  $('.post').on('click', function() {
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
        console.log('curr movie', activeMovie);
        activeMovie++;
        console.log('next movie', activeMovie);
        console.log('result movie', activeMovie > moviePostAmount ? activeMovie = 1 : activeMovie);
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
    var postInfo = nowPlayingMovies.results[index];

    $('#expand-title').text(postInfo.title);
    addTrophy(('#expand-trophy-container'), Math.ceil(postInfo.vote_average / 2));
    $('#expand-desc').text(postInfo.overview);
    $('#expand-poster').html('<img src="https://image.tmdb.org/t/p/w300' + postInfo.poster_path + '" alt="">');

    $(expandHolder + ' .post-expand-wrapper').css('opacity', 1);

  } else {
    var postInfo = popTV.results[index];

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


// Get Movies now playing in theaters

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://api.themoviedb.org/3/movie/now_playing?page=1&language=en-US&api_key=d79aada4e3638b2d2b5b220c070d814d",
//   "method": "GET",
//   "headers": {},
//   "data": "{}"
// }
//
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

var nowPlayingMovies = {
  "page": 1,
  "results": [
    {
      "poster_path": "/nHXiMnWUAUba2LZ0dFkNDVdvJ1o.jpg",
      "adult": false,
      "overview": "Underworld: Blood Wars follows Vampire death dealer, Selene, as she fends off brutal attacks from both the Lycan clan and the Vampire faction that betrayed her. With her only allies, David and his father Thomas, she must stop the eternal war between Lycans and Vampires, even if it means she has to make the ultimate sacrifice.",
      "release_date": "2016-12-01",
      "genre_ids": [
        28,
        27
      ],
      "id": 346672,
      "original_title": "Underworld: Blood Wars",
      "original_language": "en",
      "title": "Underworld: Blood Wars",
      "backdrop_path": "/PIXSMakrO3s2dqA7mCvAAoVR0E.jpg",
      "popularity": 60.691496,
      "vote_count": 325,
      "video": false,
      "vote_average": 4
    },
    {
      "poster_path": "/qjiskwlV1qQzRCjpV0cL9pEMF9a.jpg",
      "adult": false,
      "overview": "A rogue band of resistance fighters unite for a mission to steal the Death Star plans and bring a new hope to the galaxy.",
      "release_date": "2016-12-14",
      "genre_ids": [
        28,
        12,
        14,
        878,
        53,
        10752
      ],
      "id": 330459,
      "original_title": "Rogue One: A Star Wars Story",
      "original_language": "en",
      "title": "Rogue One: A Star Wars Story",
      "backdrop_path": "/tZjVVIYXACV4IIIhXeIM59ytqwS.jpg",
      "popularity": 56.525041,
      "vote_count": 568,
      "video": false,
      "vote_average": 7.5
    },
    {
      "poster_path": "/4Iu5f2nv7huqvuYkmZvSPOtbFjs.jpg",
      "adult": false,
      "overview": "Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.",
      "release_date": "2016-11-10",
      "genre_ids": [
        18,
        878
      ],
      "id": 329865,
      "original_title": "Arrival",
      "original_language": "en",
      "title": "Arrival",
      "backdrop_path": "/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg",
      "popularity": 38.293855,
      "vote_count": 764,
      "video": false,
      "vote_average": 6.5
    },
    {
      "poster_path": "/gri0DDxsERr6B2sOR1fGLxLpSLx.jpg",
      "adult": false,
      "overview": "In 1926, Newt Scamander arrives at the Magical Congress of the United States of America with a magically expanded briefcase, which houses a number of dangerous creatures and their habitats. When the creatures escape from the briefcase, it sends the American wizarding authorities after Newt, and threatens to strain even further the state of magical and non-magical relations.",
      "release_date": "2016-11-16",
      "genre_ids": [
        10751,
        12,
        14
      ],
      "id": 259316,
      "original_title": "Fantastic Beasts and Where to Find Them",
      "original_language": "en",
      "title": "Fantastic Beasts and Where to Find Them",
      "backdrop_path": "/6I2tPx6KIiBB4TWFiWwNUzrbxUn.jpg",
      "popularity": 32.46626,
      "vote_count": 1267,
      "video": false,
      "vote_average": 7
    },
    {
      "poster_path": "/h6O5OE3ueRVdCc7V7cwTiQocI7D.jpg",
      "adult": false,
      "overview": "On 15 January 2009, the world witnessed the 'Miracle on the Hudson' when Captain 'Sully' Sullenberger glided his disabled plane onto the frigid waters of the Hudson River, saving the lives of all 155 aboard. However, even as Sully was being heralded by the public and the media for his unprecedented feat of aviation skill, an investigation was unfolding that threatened to destroy his reputation and career.",
      "release_date": "2016-08-16",
      "genre_ids": [
        18,
        36
      ],
      "id": 363676,
      "original_title": "Sully",
      "original_language": "en",
      "title": "Sully",
      "backdrop_path": "/vC9H1ZVdXi1KjH4aPfGB54mvDNh.jpg",
      "popularity": 22.636098,
      "vote_count": 556,
      "video": false,
      "vote_average": 6.6
    },
    {
      "poster_path": "/vR9YvUJCead23MOWwVzv9776eb1.jpg",
      "adult": false,
      "overview": "A teenager finds himself transported to an island where he must help protect a group of orphans with special powers from creatures intent on destroying them.",
      "release_date": "2016-09-28",
      "genre_ids": [
        14
      ],
      "id": 283366,
      "original_title": "Miss Peregrine's Home for Peculiar Children",
      "original_language": "en",
      "title": "Miss Peregrine's Home for Peculiar Children",
      "backdrop_path": "/qXQinDhDZkTiqEGLnav0h1YSUu8.jpg",
      "popularity": 19.259937,
      "vote_count": 677,
      "video": false,
      "vote_average": 6.1
    },
  ]
};


var popTV = {
  "page": 1,
  "results": [
    {
      "poster_path": "/igDhbYQTvact1SbNDbzoeiFBGda.jpg",
      "popularity": 45.913942,
      "id": 57243,
      "backdrop_path": "/cVWsigSx97cTw1QfYFFsCMcR4bp.jpg",
      "vote_average": 7.02,
      "overview": "The Doctor looks and seems human. He's handsome, witty, and could be mistaken for just another man in the street. But he is a Time Lord: a 900 year old alien with 2 hearts, part of a gifted civilization who mastered time travel. The Doctor saves planets for a living – more of a hobby actually, and he's very, very good at it. He's saved us from alien menaces and evil from before time began – but just who is he?",
      "first_air_date": "2005-03-26",
      "origin_country": [
        "GB"
      ],
      "genre_ids": [
        10759,
        18,
        10765
      ],
      "original_language": "en",
      "vote_count": 309,
      "name": "Doctor Who",
      "original_name": "Doctor Who"
    },
    {
      "poster_path": "/1Dmrgwv8VcTWQOaoyWm71KOeFEE.jpg",
      "popularity": 31.117446,
      "id": 1871,
      "backdrop_path": "/27ZEH4Y8vQEyQYA8IVHCWrvkHYX.jpg",
      "vote_average": 3.6,
      "overview": "The everyday lives of working-class inhabitants of Albert Square, a traditional Victorian square of terrace houses surrounding a park in the East End of London's Walford borough.",
      "first_air_date": "1985-02-19",
      "origin_country": [
        "GB"
      ],
      "genre_ids": [
        10766,
        18
      ],
      "original_language": "en",
      "vote_count": 25,
      "name": "EastEnders",
      "original_name": "EastEnders"
    },
    {
      "poster_path": "/vxuoMW6YBt6UsxvMfRNwRl9LtWS.jpg",
      "popularity": 29.738789,
      "id": 1402,
      "backdrop_path": "/zYFQM9G5j9cRsMNMuZAX64nmUMf.jpg",
      "vote_average": 7.35,
      "overview": "Sheriff's deputy Rick Grimes awakens from a coma to find a post-apocalyptic world dominated by flesh-eating zombies. He sets out to find his family and encounters many other survivors along the way.",
      "first_air_date": "2010-10-31",
      "origin_country": [
        "US"
      ],
      "genre_ids": [
        10759,
        18
      ],
      "original_language": "en",
      "vote_count": 967,
      "name": "The Walking Dead",
      "original_name": "The Walking Dead"
    },
    {
      "poster_path": "/mBDlsOhNOV1MkNii81aT14EYQ4S.jpg",
      "popularity": 28.575594,
      "id": 44217,
      "backdrop_path": "/A30ZqEoDbchvE7mCZcSp6TEwB1Q.jpg",
      "vote_average": 6.98,
      "overview": "Vikings follows the adventures of Ragnar Lothbrok, the greatest hero of his age. The series tells the sagas of Ragnar's band of Viking brothers and his family, as he rises to become King of the Viking tribes. As well as being a fearless warrior, Ragnar embodies the Norse traditions of devotion to the gods. Legend has it that he was a direct descendant of Odin, the god of war and warriors.",
      "first_air_date": "2013-03-03",
      "origin_country": [
        "IE",
        "CA"
      ],
      "genre_ids": [
        18,
        10759
      ],
      "original_language": "en",
      "vote_count": 316,
      "name": "Vikings",
      "original_name": "Vikings"
    },
    {
      "poster_path": "/wQoosZYg9FqPrmI4zeCLRdEbqAB.jpg",
      "popularity": 23.375604,
      "id": 1418,
      "backdrop_path": "/nGsNruW3W27V6r4gkyc3iiEGsKR.jpg",
      "vote_average": 6.85,
      "overview": "The Big Bang Theory is centered on five characters living in Pasadena, California: roommates Leonard Hofstadter and Sheldon Cooper; Penny, a waitress and aspiring actress who lives across the hall; and Leonard and Sheldon's equally geeky and socially awkward friends and co-workers, mechanical engineer Howard Wolowitz and astrophysicist Raj Koothrappali. The geekiness and intellect of the four guys is contrasted for comic effect with Penny's social skills and common sense.",
      "first_air_date": "2007-09-24",
      "origin_country": [
        "US"
      ],
      "genre_ids": [
        35
      ],
      "original_language": "en",
      "vote_count": 854,
      "name": "The Big Bang Theory",
      "original_name": "The Big Bang Theory"
    },
    {
      "poster_path": "/aFWiM04UmCEnd53GNL1uFy2Qfll.jpg",
      "popularity": 22.356919,
      "id": 3034,
      "backdrop_path": "/iO69s3DPiIkCeOVITEV19bCcZRL.jpg",
      "vote_average": 5.27,
      "overview": "Tatort is a long-running German/Austrian/Swiss, crime television series set in various parts of these countries. The show is broadcast on the channels of ARD in Germany, ORF 2 in Austria and SF1 in Switzerland. The first episode was broadcast on November 29, 1970. The opening sequence for the series has remained the same throughout the decades, which remains highly unusual for any such long-running TV series up to date.\n\nEach of the regional TV channels which together form ARD, plus ORF and SF, produces its own episodes, starring its own police inspector, some of which, like the discontinued Schimanski, have become cultural icons.\n\nThe show appears on DasErste and ORF 2 on Sundays at 8:15 p.m. and currently about 30 episodes are made per year. As of March 2013, 865 episodes in total have been produced.\n\nTatort is currently being broadcast in the United States on the MHz Worldview channel under the name Scene of the Crime.",
      "first_air_date": "1970-11-29",
      "origin_country": [
        "AT",
        "DE",
        "CH"
      ],
      "genre_ids": [
        18,
        80
      ],
      "original_language": "de",
      "vote_count": 13,
      "name": "Scene of the Crime",
      "original_name": "Tatort"
    },
    {
      "poster_path": "/jIhL6mlT7AblhbHJgEoiBIOUVl1.jpg",
      "popularity": 22.286895,
      "id": 1399,
      "backdrop_path": "/mUkuc2wyV9dHLG0D0Loaw5pO2s8.jpg",
      "vote_average": 7.79,
      "overview": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and icy horrors beyond.",
      "first_air_date": "2011-04-17",
      "origin_country": [
        "US"
      ],
      "genre_ids": [
        10765,
        10759,
        18
      ],
      "original_language": "en",
      "vote_count": 1408,
      "name": "Game of Thrones",
      "original_name": "Game of Thrones"
    },
  ]
};
