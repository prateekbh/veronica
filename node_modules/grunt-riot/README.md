# grunt-riot

> grunt plugin for riot

This plugin compile [riot](https://github.com/muut/riotjs)'s `.tag` files.

## Getting Started
This plugin requires Grunt.

```shell
npm install grunt-riot --save-dev
```

Once that's done, add this line to your project's Gruntfile Or use [load-grunt-tasks](https://github.com/sindresorhus/load-grunt-tasks) 

```js
grunt.loadNpmTasks('grunt-riot');
```


### Usage Examples

```js
grunt.initConfig({
  riot: {
    options:{
        template : 'jade',
        type : 'coffeescript'
    },
    dist: {
        expand: true,
        cwd: '<%= app %>/scripts',
        src: '**/*.tag',
        dest: '<%= app %>/scripts',
        ext: '.js'
    }
  },
})
```

if you want concat to a single file  , take care not to set `expand: true` ，eg:

```js
grunt.initConfig({
  riot: {
    options: {
        concat : true
    },
    src: 'script/*.tag',
    dest: '.tmp/tag.js'
  },
})
```



### Options
* compact: `Boolean`
	* no whitespace between tags . eg : '<a></a> <span></span>' to '<a></a><span></span>'
	* default : `true`
* expr: `Boolean`
	* expressions trough parser
	* default : `true`
* type: `String`
	* javaScript parser type
	* default : `null`
* template: `String`
	* template parser
	* default : `null`
* parser: `Function`
	* custom javascript parser method
	* default : `null`
* fileConfig: `Function`
	* you can set single file compile option in callback 
	* default : `null`
* concat: `Boolean`
	* you can concat multiple tag file to a single file 
	* default : `false`

if you want use typescript , coffee or es , you should install compile module

* typescript :  typescript-simple
* coffeescript :  coffee-script
* es6 :  6to5
* jade :  jade

See more: [https://muut.com/riotjs/compiler.html](https://muut.com/riotjs/compiler.html)


## Release History
2015-01-26  0.0.1

## License
Copyright (c) 2015 . Licensed under the MIT license.
