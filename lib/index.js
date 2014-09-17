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

var languages = require('./languages');

module.exports = function run (dat, ready) {
    var INTERVAL = 20000; //24 * 60 * (60 * 1000); 

    function log (message) {
        message = '[dat-github-trending] ' + message;
    
        console.log.apply(console, arguments);
    }

    function schedule () {
        setTimeout(start, INTERVAL);
    }

    function start () {
        log('Fetching languages from GitHub ...');
        // Fetch the languages first
        languages(function (err, languages) {
            var langs = {};

            if (err) {
                return log('Failed to fetch the languages: %s', err.message);
            }
            
            log('Done.');

            Object.keys(languages).forEach(function (language) {
                language = languages[language];
                langs[language] = function (callback) {
                    log('%s: Fetching from GitHub.', language);
                    trending(language, callback);
                };
            });

            async.series(langs, finish);
        });
    }
    
    function finish (err, results) {
        var timestamp = dateformat(Date.now(), 'yyyymmdd');
        var key = '%d!%s'; // e.g. 20140902!javascript
        var language;

        if (err) {
            log('Error while fetching the trending repositories: %s - Will try again in %d ms.', err.message, INTERVAL);

            return schedule();
        }

        for (language in results) {
            if (results.hasOwnProperty(language)) {
                log(' %s: Will write trending repositories into dat.', language);

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

    function written (err, entry) {
        var language;

        if (err) {
            return log('Error or conflict occurred', err);
        }

        // Check if this was the last entry.
        language = entry.key.split('!')[1];

        log(' %s: Done (key: %s).', language, entry.key);

        if (Object.keys(languages).indexOf(language) === Object.keys(languages).length - 1) {
            log(' > All done. Will run again in %d ms', INTERVAL);
            
            schedule();
        }
    }

    process.nextTick(ready);

    // Start for the first time.
    start();
};