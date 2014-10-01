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
var cron = require('node-schedule');
var dateformat = require('dateformat');
var trending = require('github-trending');
var VError = require('verror');

module.exports = function run (dat, ready) {

    var SCHEDULE = {hour: 16, minute: 00}; 

    function log () {
        var args = Array.prototype.slice.call(arguments, 0);

        args[0] = '[dat-github-trending] - ' + dateformat(Date.now(), 'dd.mm.yyyy HH:MM:ss') + ' - '  + args[0];

        console.log.apply(console, args);
    }
    
    function persist (repository) {
        return function (callback) {
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
        return function (callback) {
            log('Importing: %s', language);

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

                async.series(tasks, callback);
            }

            trending(language, onFetch);
        };
    }

    function run () {
        var workflow = [];

        log('Starting new import cycle ...');

        trending.languages(function extract (err, languages) {
            var tasks = [];

            log('Importing trending repositories of %d language(s).', languages.length);

            languages.forEach(function (language) {
                tasks.push(trendy(language));
            });

            async.series(tasks, function (err) {
                if (err) {
                    return console.error(err);
                }

                log('Done.');
            });
        });
    }

    process.nextTick(ready);

    cron.scheduleJob(SCHEDULE, run);
};
