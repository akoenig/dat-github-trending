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

var VError = require('verror')
var request = require('superagent');
var cheerio = require('cheerio');

module.exports = function fetch (callback) {
    request
        .get('https://github.com/trending')
        .end(function (err, res) {
            var $ = cheerio.load(res.text);
            var results = [];
    
            if (err) {
                return callback(new VError(err, 'failed to fetch the available languages.'));
            }
    
            $('.select-menu-item-text.js-select-button-text.js-navigation-open').each(function (index, elem) {
                elem = $(elem);
                results.push(elem.attr('href').split('=')[1]);
            });
    
            callback(null, results);
        });
};