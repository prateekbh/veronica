/* =====================================
    Grunt Scripts
=======================================*/

var compiledFile = "./veronica.js";
var compiledFileWithCompiler = "./veronica+compiler.js";
var compiledMinFile = "./veronica.min.js";
var compiledMinFile = "./veronica.min.js";

var jsFiles = [
    "./node_modules/riot/riot.js",
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

var jsFilesWithCompiler = [
    "./node_modules/riot/riot+compiler.js",
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
            concat_js_wo_compiler: {
                src: jsFiles,
                dest: compiledFile,
            },
            concat_js_with_compiler: {
                src: jsFilesWithCompiler,
                dest: compiledFileWithCompiler,
            }
        },

        uglify: {
            veronica: {
                files: {
                    'veronica.min.js': ['veronica.js']
                }
            },
            veronica_compiler: {
                files: {
                    'veronica+compiler.min.js': ['veronica+compiler.js']
                }
            }
        }
    });

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks("grunt-contrib-concat");

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Task for building the static contents of the application
    grunt.registerTask("default", ["clean:pre_build", "concat","uglify"]);
};
