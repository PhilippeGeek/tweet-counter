/**
 * Created by pvienne on 06/07/2016.
 */
var Twit = require('twit');
var querystring = require("querystring");
var dateFormat = require('dateformat');

var T = new Twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret,
    timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

var tweets = {};
var count = 0;
var twitter_callback = function(error, data, response){
    data.statuses.forEach(function(e){
        if(tweets[e.user.screen_name.toString()] == undefined){
            tweets[e.user.screen_name.toString()] = 1;
        } else {
            tweets[e.user.screen_name.toString()]++;
        }
    });
    count += data.statuses.length;
    if(data.search_metadata.next_results != undefined){
        T.get('search/tweets',querystring.parse(data.search_metadata.next_results.substring(1)), twitter_callback);
    } else {
        endedCallback();
    }
};

var date = (new Date());
var today = dateFormat(date, "yyyy-mm-dd");
T.get('search/tweets', { q: '#'+process.env.hashtag+' since:'+today+' -RT', count:100 }, twitter_callback);

function endedCallback(){
    var tuples = [];

    for (var k in tweets) tuples.push([k, tweets[k]]);

    tuples.sort(function(a, b) {
        a = a[1];
        b = b[1];

        return a < b ? -1 : (a > b ? 1 : 0);
    });

    for (var i = tuples.length-1; i > tuples.length-4 && i >= 0; i--) {
        var key = tuples[i][0];
        var value = tuples[i][1];
        console.log(key +' : '+value);
    }

    console.log(count + ' tweets today for #SophiaConf2016');
}