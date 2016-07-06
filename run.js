var fetch_tweets = require('./lib/fetch_tweets.js');

fetch_tweets(function (tweets) {

    // Count tweets for each user
    var counts = {};

    tweets.forEach(function(tweet){
        if(counts[tweet.user.screen_name] == undefined)
            counts[tweet.user.screen_name] = 1;
        else
            counts[tweet.user.screen_name]++;
    });

    // Assemble them as tuples
    var scores = [];

    for (var k in counts) scores.push([k, counts[k]]);

    // Order them
    scores.sort(function (a, b) {
        a = a[1];
        b = b[1];

        return a < b ? -1 : (a > b ? 1 : 0);
    });

    // Print results
    for (var i = scores.length - 1; i > scores.length - 4 && i >= 0; i--) {
        var key = scores[i][0];
        var value = scores[i][1];
        console.log(key + ' : ' + value);
    }

    console.log(tweets.length + ' tweets today for #SophiaConf2016');

});