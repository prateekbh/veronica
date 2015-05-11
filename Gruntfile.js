/* =====================================
    Grunt Scripts
=======================================*/


module.exports = function(grunt) {

    /* =====================================
        Quest settings
    =======================================*/
    var questSettings = grunt.file.readJSON("./quest_settings.json");

    //tag folder name
    var tagsFolder = questSettings.quest.tagFolder || "tags";

    /* =====================================
        CSS Files List
    =======================================*/
    var cssFilesList = grunt.file.readJSON("./css_files.json");
    var compiledCssPath = "./css/quick_styles.css";

    /* =====================================
        JS Files List
    =======================================*/
    //var jsFilesList=grunt.file.readJSON("./jsFiles.json");


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        clean: {
            pre_build: [tagsFolder + "/**/*.js", questSettings.quest.compiledStackFile, compiledCssPath],
            post_build: [compiledCssPath.replace(".css", ".scss")]
        },

        concat: {
            concat_tags: {
                src: tagsFolder + "/**/*.html",
                dest: questSettings.quest.compiledTagFile,
            },
            concat_js: {
                src: [questSettings.quest.riotFilePath, questSettings.quest.questFilePath],
                dest: questSettings.quest.compiledStackFile
            },
            concat_scss: {
                src: cssFilesList.css_files,
                dest: compiledCssPath.replace(".css", ".scss")
            }
        },

        sass: {
            transpile_scss: {
                options: {
                    compass: true,
                    trace: true
                },
                files: [{
                    expand: true,
                    src: compiledCssPath.replace(".css", ".scss"),
                    ext: '.css',
                    dest: "./public/"
                }]
            }
        },

        appcache: {
            app: {
                dest: 'manifests/manifest.mf',
                cache: {
                    literals: [
                        "/",
                        "/public/tags/compiled_tags.html",
                        "/public/javascripts/compiled_js.js",
                        "/public/css/quick_styles.css",
                        "/public/images/food.jpg",
                        "/public/images/quick_logo.png"
                    ]
                },
                network: '*'
            }
        },

        watch: {
            css: {
                files: cssFilesList.css_files,
                tasks: ['make-css'],
                options: {
                    nospawn: true
                }
            },
            js: {
                files: tagsFolder + "/**/*.html",
                tasks: ['make-js'],
                options: {
                    nospawn: true
                }
            }

        }

    });

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the plugin that provides the "riot" task.
    grunt.loadNpmTasks("grunt-riot");

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks("grunt-contrib-concat");

    // Load the plugin that provides the "sass" task.
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Load the grunt watch so that every time grunt compiles automatically
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Load the grunt app chache so that app cache is updated automatically
    grunt.loadNpmTasks('grunt-appcache');

    //Task for building css static contents of the application
    grunt.registerTask("make-css", ["concat:concat_scss", "sass:transpile_scss"]);

    //Task for building javascript static contents of the application
    grunt.registerTask("make-js", ["concat:concat_tags", "concat:concat_js"]);

    //Task for building the static contents of the application
    grunt.registerTask("default", ["clean:pre_build", "make-css", "make-js", "appcache:app", "clean:post_build"]);
};
