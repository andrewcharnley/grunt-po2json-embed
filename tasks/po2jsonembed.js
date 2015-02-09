/*
 * grunt-po2jsonEmbed
 *
 * Copyright (c) 2015 Andrew Charnley, igaro.com
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {

  grunt.registerMultiTask('po2jsonEmbed', 'Convert PO to JSON & Embed', function() {

    var options = this.options({
      poFiles:'',
      defaultLanguage : 'en'
    });

    var fs = require('fs'),
        po2json = require('po2json'),
        dir = options.poFiles,
        data = {},
        fn = options.functionName;

    var val,
      json,
      lang,
      files = fs.readdirSync(dir)
      .filter(function(file) { return file.substr(-3) === '.po'; })
      .forEach(function(file) {
          json = po2json.parseFileSync(dir+'/'+file, {});
          lang = json[''].language;
          grunt.log.writeln('Loaded PO file: '+lang);
          Object.keys(json).forEach(function (k) {
              val = json[k][1];
              if (! k.length || ! val.length)
                return;
              if (!data[k])
                data[k] = {};
              data[k][lang] = val;
          });
      });

      var content, 
      	newcontent;

      this.files.forEach(function (f) {
        f.src.forEach(function(file) {

          content = newcontent = grunt.file.read(file);
          
          ['"',"'"].forEach(function(quote) {
              var regex = new RegExp("" + fn + "\\(((?:" + quote + "(?:[^" + quote + "\\\\]|\\\\.)+" + quote + "\\s*)+)\\)", "g");
              newcontent = newcontent.replace(regex, function(v) {
                v = v.substr(fn.length+2);
                v = v.substr(0,v.length-2);
                var o = data[v] || {};
                o[options.defaultLanguage] = v;
                return JSON.stringify(o);
              });
          });

          if (newcontent !== content) {
            grunt.log.writeln('Embedded translations: '+file);
            grunt.file.write(file, newcontent);
          }

        });
      });

  });

};
