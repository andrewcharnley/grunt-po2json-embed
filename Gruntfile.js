/*
 * grunt-po2json-embed
 * https://github.com/andrewcharnley/
 *
 * Copyright (c) 2014 Andrew Charnley, andrewcharnley.com
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: [
                "Gruntfile.js",
                "tasks/*.js"
            ],
            options: {
                jshintrc: ".jshintrc",
            }
        }

    });

    grunt.loadTasks("tasks");

    grunt.loadNpmTasks("grunt-contrib-jshint");
};
