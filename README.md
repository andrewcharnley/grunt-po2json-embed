# grunt-po2json-embed

> A Grunt plugin to convert PO translation files into JSON objects which are then embedded into the original files.

## Introduction

Translations are wrapped in a function which is recognised by a parser, which generates a list of strings into a POT file. From this one generates language support by way of PO files. This project takes these PO files, scans the original files and embeds language as a JSON object.

The name of your PO files are used for the JSON object keys. It is highly recommended you use IETF tags for the file names (i.e en-GB, fr).

Most likely your original strings will be in English, so you wont generate an 'en' PO file. By default an en key will be added to the JSON, but you can change this in the options.

## Theory

Files contain i18n("The color is red"). Another plugin such as grunt-xgettext scans these files and generates a POT file. You use poedit to create your language support by way of fr.po and en-GB.po.

This plugin takes the fr, en-GB file(s) and makes a structure.

```json
{
  "en" : "This is a color",
  "en-GB" : "This is a colour",
  "fr" : "Ceci est une couleur"
} 
```

It then replaces i18n("The color is red") with this structure, which is used with logic. Normally you'd write a function which knows the user language (i.e en-GB), attempts to match the key and if no match is found tries the denominator and then the default (in this case, en).

If you need such a function, see mapkey in core.language.js, found in the Igaro App project on github.

Given the files are replaced, you'll want to copy your source files into a build folder. You probably do this anyway by way of a js minify script.

## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once
you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-po2json-embed --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of
JavaScript:

```js
grunt.loadNpmTasks('grunt-po2json-embed');
```

## The "po2jsonEmbed" task

### Overview
In your project's Gruntfile, add a section named `po2jsonEmbed` to the data object passed into
`grunt.initConfig()`.

```js
grunt.initConfig({
  po2jsonEmbed: {
    options: {
      functionName: "tr",
      poFiles: "translations",
      defaultLanguage: "en"
    },
    target: {
      files: {
        js : [builddir+'/**/*.html', builddir+'/**/*.js']
    }
  },
})
```

### Options

#### options.functionName
Type: `String`
Default value: `"tr"`

The function name that marks translatable messages. Usually tr or i18n.

#### options.poFiles
Type: `String`
Default value: `""`

The directory containing your .po files

#### options.defaultLanguage
Type: `String`
Default value: `en`

### Files

Assuming the default functionName is used, translatable messages look like this:

    tr("Some translatable message")

Note: pluralisation is not supported. Instead use two strings and use Javascript to do the logic.

    tr("You have %1 follower" "You have %1 followers" numFollowers) - WRONG

    tr("You have %1 follower"),  tr("You have %1 followers") - GOOD

### Usage Examples

#### Real-world example

```js
module.exports = function(grunt) {

    var _ = grunt.util._;
    var locales = ["fr"];
    var prodir = 'debug';
    var builddir = 'build/'+prodir;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
    
        watch : {
            compass: {
                files: ['compile/css/*.scss'],
                tasks: ['compass:build']
            },
            js: {
                files: ['compile/js/*.js'],
                tasks: ['copy:js']
            },
            copy: {
                files: ['copy/**/*'],
                tasks: ['copy:base']
            },
            translations: {
                files: [builddir+'/*.html', 'build/**/*.js'],
                tasks: ['xgettext', 'shell']
            },
            transplant: {
                files: ['translations/*.po'],
                tasks: ['po2jsonEmbed']
            },

        },

      clean: {
            build: {
                src: [builddir]
            }
      },

        compass: {
            build: {
                options: {              
                    config: 'compass-'+prodir+'.rb'
                }
            }
        },

      connect: {
         server: {
                options: {
                    port: 4000,
                    base: builddir+'/',
                    hostname: '*'
                }
            }
      },
        
        copy: {
            base: {
                files: [
                    {
                        expand: true,
                        cwd: 'copy', src: ['**'],
                        dest: builddir+'/'
                    }
                ]
            },

            js: {
                files: [
                    {
                        expand: true,
                        cwd: 'compile/js', src: ['**'],
                        dest: builddir+'/cdn/js'
                    }
                ]
            }
        },

      xgettext: {
          target: {
                files: {
                    html: [builddir+'/**/*.html', builddir+'/**/*.js']
                },
                options: {
                    functionName: '_tr',
                    potFile: 'translations/messages.pot'
                }
          }
      },

        po2jsonEmbed: {
            target: {
                files : {
                    js : [builddir+'/**/*.html', builddir+'/**/*.js']
                },
                options: {
                    functionName: '_tr',
                    poFiles: 'translations',
                }
            }
        },

      shell: {
          options: {
            failOnError: true
          },
          msgmerge: {
            // todo: dynamic po file list would be better
            command: _.map(locales, function(locale) {
            var po = "translations/" + locale + ".po";
            return "if [ -f \"" + po + "\" ]; then\n" +
                   "    echo \"Updating " + po + "\"\n" +
                   "    msgmerge " + po + " translations/messages.pot > .new.po.tmp\n" +
                   "    exitCode=$?\n" +
                   "    if [ $exitCode -ne 0 ]; then\n" +
                   "        echo \"Msgmerge failed with exit code $?\"\n" +
                   "        exit $exitCode\n" +
                   "    fi\n" +
                   "    mv .new.po.tmp " + po + "\n" +
                   "fi\n";
            }).join("")
          }
      }

    });
    
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-xgettext');
    grunt.loadNpmTasks('grunt-po2json-embed');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('build', ['clean:build', 'copy:base', 'copy:js', 'compass:build','xgettext','shell','po2jsonEmbed']);

    grunt.registerTask('default', ['build','connect','watch']);
};

```

## Release History

### 0.1

* Initial release. Implemented for Igaro App SPA JS Framework.
