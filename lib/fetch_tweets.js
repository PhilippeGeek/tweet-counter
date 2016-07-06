/**
 * Created by pvienne on 06/07/2016.
 */
var Twit = require('twit');
var querystring = require("querystring");
var dateFormat = require('dateformat');

var tweets = {};
var count = 0;
var date = (new Date());
var today = dateFormat(date, "yyyy-mm-dd");

module.exports = function(config, callback) {

    if(typeof config == 'function') {
        callback = config;
        config = {};
    } else {
        if (config == undefined){
            config = {};
        }
    }

    var c = {
        consumer_key: process.env.consumer_key,
        consumer_secret: process.env.consumer_secret,
        access_token: process.env.access_token,
        access_token_secret: process.env.access_token_secret,
        timeout_ms: 60*1000  // optional HTTP request timeout to apply to all requests.
    };

    c.forEach(function(value, key){
        if(config[key] != undefined)
            c[key] = config[key]
    });

    var T = new Twit(c);

    var twitter_callback = function(callback, tweets) {
        return function(error, data, response){
            if(tweets == undefined)
                tweets = [];
            data.statuses.forEach(tweets.push);
            if(data.search_metadata.next_results != undefined){
                T.get('search/tweets',querystring.parse(data.search_metadata.next_results.substring(1)), twitter_callback(callback, tweets));
            } else {
                callback(tweets);
            }
        }
    };

    T.get('search/tweets', {
        q: '#' + (config.hashtag || process.env.hashtag) + ' ' + (config.conditions || ('since:' + today + ' -RT')),
        count: 100
    }, twitter_callback(callback || function (tweets) {

        // Make order
        var scores = [];

        for (var k in tweets) scores.push([k, tweets[k]]);

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

        console.log(count + ' tweets today for #SophiaConf2016');

    }));
}