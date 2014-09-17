/*
 * dat-github-trending
 *
 * Copyright(c) 2014 André König <andre.koenig@posteo.de>
 * MIT Licensed
 *
 */

/**
 * @author André König <andre.koenig@posteo.de>
 *
 */

'use strict';

var util = require('util');

var async = require('async');
var trending = require('github-trending');
var dateformat = require('dateformat');
var debug = require('debug')('dat-github-trending');

var languages = (function (languages) {
    var langs = {};

    Object.keys(languages).forEach(function (language) {
        language = languages[language];
        langs[language] = function (callback) {
            trending(language, callback);
        };
    });
    return langs;
})(require('./languages'));

module.exports = function run (dat, ready) {
    var INTERVAL = 24 * 60 * (60 * 1000); 

    function schedule () {
        setTimeout(start, INTERVAL);
    }

    function start () {
        async.parallel(languages, finish);
    }
    
    function finish (err, results) {
        var timestamp = dateformat(Date.now(), 'yyyymmdd');
        var key = '%d!%s'; // e.g. 20140902!javascript
        var language;

        if (err) {
            debug('Error while fetching the trending repositories: %s - Will try again in %d ms.', err.message, INTERVAL);
            return schedule();
        }

        for (language in results) {
            if (results.hasOwnProperty(language)) {
                write(util.format(key, timestamp, language), results[language]);
            }
        }
    }

    function write (key, repositories) {
        var data = {
            key: key,
            repositories: repositories
        };

        dat.put(data, written);
    }

    function written (err, updated) {
        if (err) {
            return debug('error and/or conflict', err);
        }

        debug('put new entry', updated);
    }

    process.nextTick(ready);

    // Start for the first time.
    start();
};