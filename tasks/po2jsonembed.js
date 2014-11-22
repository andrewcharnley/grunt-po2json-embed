/*
 * grunt-xgettext
 * https://github.com/arendjr/grunt-xgettext
 *
 * Copyright (c) 2013-2014 Arend van Beelen, Speakap BV
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {

  grunt.registerMultiTask('po2jsonEmbed', 'Convert PO to JSON & Embed', function() {

    var options = this.options({
      poFiles:'',
      defaultLang : 'en'
    });

    var fs = require('fs');
    var po2json = require('po2json');
    var dir = options.poFiles;
    var data = {};
    var fn = options.functionName;

    var files = fs.readdirSync(dir)
      .filter(function(file) { return file.substr(-3) === '.po'; })
      .forEach(function(file) {
          var json = po2json.parseFileSync(dir+'/'+file, {});
          var lang = json[''].language;
          grunt.log.writeln('Loaded PO file: '+lang);
          Object.keys(json).forEach(function (k) {
              if (! k.length)
                return;
              if (!data[k])
                data[k] = {};
              data[k][lang] = json[k][1];
          });
      });

      this.files.forEach(function (f) {
        f.src.forEach(function(file) {

          var content = grunt.file.read(file);
          var newcontent = null;

          var replaceStrings = function(quote) {
              var regex = new RegExp("" + fn + "\\(((?:" + quote + "(?:[^" + quote + "\\\\]|\\\\.)+" + quote + "\\s*)+)\\)", "g");
              var subRE = new RegExp(quote + "((?:[^" + quote + "\\\\]|\\\\.)+)" + quote, "g");
              var quoteRegex = new RegExp("\\\\" + quote, "g");

              newcontent = content.replace(regex, function(v) {
                v = v.substr(fn.length+2);
                v = v.substr(0,v.length-2);
                var o = data[v] || {};
                o[options.defaultLang] = v;
                return JSON.stringify(o);
              });
          };

          replaceStrings("'");
          replaceStrings('"');

          if (newcontent && content !== newcontent) {
            grunt.log.writeln('Embedded translations: '+file);
            grunt.file.write(file, newcontent);
          }

        });
      });

  });

};
