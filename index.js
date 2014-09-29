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

var dateformat = require('dateformat');
var trending = require('github-trending');
var vasync = require('vasync');
var VError = require('verror');

module.exports = function run (dat, ready) {

    var INTERVAL = 24 * 60 * (60 * 1000); // Every day.

    function log () {
        var args = Array.prototype.slice.call(arguments, 0);

        // TODO: Add timestamp
        args[0] = '[dat-github-trending] ' + args[0];

        console.log.apply(console, args);
    }
    
    function persist (repository) {
        return function writer (callback) {
            var timestamp = dateformat(Date.now(), 'yyyymmdd');
            var key = '%d!%s!%d'; // e.g. 20140902!javascript!0

            function onWrite (err, repository) {
                if (err) {
                    return callback(new VError(err, 'failed to write the repository entry.'));
                }

                callback(null);
            }

            dat.put({
                key: util.format(key, timestamp, repository.language, repository.order),
                order: repository.order,
                title: repository.title,
                owner: repository.owner,
                description: repository.description,
                url: repository.url
            }, onWrite);
        };
    }

    function trendy (language) {
        return function handler (callback) {
            log('Proceeding: %s', language);

            function onFetch (err, repositories) {
                var tasks = [];

                if (err) {
                    return callback(new VError(err, 'failed to fetch trending %s repositories.', language));
                }

                repositories.forEach(function (repository, index) {
                    repository.order = index;
                    repository.language = language;

                    tasks.push(persist(repository));
                });

                vasync.waterfall(tasks, callback);
            }

            trending(language, onFetch);
        };
    }

    function run () {
        var workflow = [];

        log('Fetch available language information ...');

        trending.languages(function extract (err, languages) {
            var tasks = [];

            log('Fetched %d language(s).', languages.length);

            languages.forEach(function (language) {
                tasks.push(trendy(language));
            });

            vasync.waterfall(tasks, function (err) {
                if (err) {
                    return console.error(err);
                }


                
            });
        });
    }

    process.nextTick(ready);

    run();
};
