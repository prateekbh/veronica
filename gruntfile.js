/* =====================================
    Grunt Scripts
=======================================*/

var compiledFile = "./veronica.js";
var compiledFileWithCompiler = "./veronica+compiler.js";
var compiledMinFile = "./veronica.min.js";
var compiledMinFile = "./veronica.min.js";

var jsFiles = [
    "./wrap/prefix.js",
    "./lib/capabilities.js",
    "./lib/sizzle.js",
    "./lib/dispatcher.js",
    "./lib/promises.js",
    "./lib/ajax.js",
    "./lib/storage.js",
    "./lib/extend.js",
    "./lib/router.js",
    "./flux-classes/actions.js",
    "./flux-classes/stores.js",
    "./lib/init.js",
    "./wrap/suffix.js"
];

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            pre_build: [compiledFile, compiledMinFile]
        },

        concat: {
            concat_js: {
                src: jsFiles,
                dest: compiledFile,
            }
        },

        uglify: {
            veronica: {
                files: {
                    'veronica.min.js': ['veronica.js']
                }
            }
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['./veronica.js'],
                        dest: './demo/page-transition/'
                    },
                    {
                        expand: true,
                        src: ['./veronica.js'],
                        dest: './demo/shoppingbag/'
                    }
                ]
            }
        }
    });

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks("grunt-contrib-concat");

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provides the "copy" task.
    grunt.loadNpmTasks("grunt-contrib-copy");

    //Task for building the static contents of the application
    grunt.registerTask("default", ["clean:pre_build", "concat", "uglify","copy"]);
};
