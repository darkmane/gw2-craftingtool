/*
<<<<<<< HEAD
=======
@license
>>>>>>> c1f1c0245c1e758c87615890761fa945d9fdaee5
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include promise polyfill for node 0.10 compatibility
require('es6-promise').polyfill();


// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var historyApiFallback = require('connect-history-api-fallback');
var packageJson = require('./package.json');
var crypto = require('crypto');
var ensureFiles = require('./tasks/ensure-files.js');

var gw2 = require('./app/scripts/gw2.js')
var file = require('gulp-file');
var http_request = require('request');
var through2 = require('through2');
var toArray = require('stream-to-array');

// var ghPages = require('gulp-gh-pages');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DIST = 'dist';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var baseURI = "https://api.guildwars2.com";

var styleTask = function(stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('app', stylesPath, src);
    }))
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe($.minifyCss())
    .pipe(gulp.dest(dist(stylesPath)))
    .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = function(src, dest) {
  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = function(src, dest) {
  var assets = $.useref.assets({
    searchPath: ['.tmp', 'app']
  });

  return gulp.src(src)
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({
      title: 'html'
    }));
};

// Compile GW2 Item list
gulp.task('generate-data', function () {
  var data = ''
  var output = [];
  // var writer = fs.createWriteStream('app/scripts/itemlist.json');
  // writer.write(JSON.stringify(output));
  // var lookupByNameWriter = fs.createWriteStream('app/scripts/itemtypebyname.json');
  // lookupByNameWriter.write(JSON.stringify(TypeLookupHash));
  // var lookupByIdWriter = fs.createWriteStream('app/scripts/itemtypebyid.json');
  // lookupByIdWriter.write(JSON.stringify(convertTypeHash2Array(TypeLookupHash)));
  var returnStream =  http_request.get(baseURI + '/v2/items').on('error', function(err){
    console.log(err)
  }).pipe(through2.obj(function (chunk, enc, callback){
    data += chunk;
    callback();
  },
  function(callback){
    var item_list = JSON.parse(data);
		var item_id = item_list.pop();

		do {

			this.push(item_id);
			item_id = item_list.pop();

		}while(item_list.length > 0);

    callback();
	}
  )).pipe(through2.obj(
    function(chunk, enc, callback){
					http_request.get(baseURI + '/v2/recipes/search?output=' + chunk.toString(), function(error, response, body) {
						if(error != undefined) {
							console.log(error);
							callback();
							return;
						}
						var recipes = JSON.parse(body);
						if(recipes.length > 0) {
							var data = {id: chunk};
            	data.recipe_list = recipes;
              callback(null, data);
						}else {
							callback();
						}

					});
		}
  )).pipe(through2.obj(
    function(data, enc, callback){

			http_request.get(baseURI + '/v2/items?ids=' + data.id, function(error, response, body) {
				if(error != undefined) {
					console.log("ERROR getting items");
					console.log(error);
					callback();
					return;
				}
			  var items = JSON.parse(body);
				var itemObj = [];
        for(var counter = 0; counter < items.length; counter++){
          var item=items[counter];
         	var typeAndSubtype = getItemTypeIdAndSubtypeId(item.type, item.details);
					data.name = item.name;

          data.type_id = typeAndSubtype.typeId;
          data.subtype_id = typeAndSubtype.subTypeId;

          console.log(data.name + " [" + data.id + "]");
					callback(null, data);
				}
			});

    }
  ));

  console.log('Creating array');
  toArray(returnStream, function (err, arr){
    if(err == undefined){
      var itemlist_writer =fs.createWriteStream('app/scripts/itemlist.json');
      console.log('Writing File');
      itemlist_writer.write(JSON.stringify(arr));

    }
  });
  return returnStream;
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
  return styleTask('styles', ['**/*.css']);
});


// Ensure that we are not missing required files for the project
// "dot" files are specifically tricky due to them being hidden on
// some systems.
gulp.task('ensureFiles', function(cb) {
  var requiredFiles = ['.bowerrc'];

  ensureFiles(requiredFiles.map(function(p) {
    return path.join(__dirname, p);
  }), cb);
});

// Optimize images
gulp.task('images', function() {
  return imageOptimizeTask('app/images/**/*', dist('images'));
});

// Copy all files at the root level (app)
gulp.task('copy', function() {
  var app = gulp.src([
    'app/*',
    '!app/test',
    '!app/elements',
    '!app/bower_components',
    '!app/cache-config.json',
    '!**/.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest(dist()));

  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  var bower = gulp.src([
    'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  ]).pipe(gulp.dest(dist('bower_components')));

  return merge(app, bower)
    .pipe($.size({
      title: 'copy'
    }));
});

// Copy web fonts to dist
gulp.task('fonts', function() {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest(dist('fonts')))
    .pipe($.size({
      title: 'fonts'
    }));
});

// Scan your HTML for assets & optimize them

gulp.task('build', ['images', 'fonts'], function() {
  return gulp.src(['app/**/*.html', '!app/{elements,test,bower_components}/**/*.html'])
    .pipe($.useref())
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    .pipe(gulp.dest(dist()))
});

// Vulcanize granular configuration
gulp.task('vulcanize', function() {
  return gulp.src('app/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest(dist('elements')))
    .pipe($.size({title: 'vulcanize'}));
});

// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', function(callback) {
  var dir = dist();
  var config = {
    cacheId: packageJson.name || path.basename(__dirname),
    disabled: false
  };

  glob([
    'index.html',
    './',
    'bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '{elements,scripts,styles}/**/*.*'],
    {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache));
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

// Clean output directory
gulp.task('clean', function() {
  return del(['.tmp', dist()]);
});

// Watch files for changes & reload

gulp.task('serve', ['styles'], function() {

  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [historyApiFallback()]
    }
  });

  gulp.watch(['app/**/*.html', '!app/bower_components/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], reload);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: dist(),
    middleware: [historyApiFallback()]
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  // Uncomment 'cache-config' if you are going to use service workers.
  runSequence(
    ['ensureFiles', 'copy', 'styles'],
    'build',
    'vulcanize', 'cache-config',
    cb);
});

// Build then deploy to GitHub pages gh-pages branch
gulp.task('build-deploy-gh-pages', function(cb) {
  runSequence(
    'default',
    'deploy-gh-pages',
    cb);
});


// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');

} catch (err) {
  // Do nothing

}

var TypeLookupHash = {
  'Armor': {
    typeId: 0, subTypes: {
      'Boots': 0,
      'Coat': 1,
      'Gloves': 2,
      'Helm': 3,
      'HelmAquatic': 4,
      'Leggings': 5,
      'Shoulders': 6
    }
  },
  'Back': {typeId: 1},
  'Bag': {typeId: 2},
  'Consumable': {
    typeId: 3, subTypes: {
      'AppearanceChange': 0,
      'Booze': 1,
      'ContractNpc': 2,
      'Food': 3,
      'Generic': 4,
      'Halloween': 5,
      'Immediate': 6,
      'Transmutation': 7,
      'Unlock': 8,
      'UpgradeRemoval': 9,
      'Utility': 10,
      'TeleportToFriend': 11    }
  },
  'Container': {
    typeId: 4, subTypes: {
      'Default': 0,
      'GiftBox': 1,
      'OpenUI': 2
    }
  },
  'CraftingMaterial': {
    typeId: 5
  },
  'Gathering': {
    typeId: 6, subTypes: {
      'Foraging': 0,
      'Logging': 1,
      'Mining': 2
    }
  },
  'Gizmo': {
    typeId: 7, subTypes: {
      'Default': 0,
      'ContainerKey': 1,
      'RentableContractNpc': 2,
      'UnlimitedConsumable': 3,
    }
  },
  'MiniPet': {typeId: 8},
  'Tool': {typeId: 9},
  'Trait': {typeId: 10},
  'Trinket': {
    typeId: 11, subTypes: {
      'Accessory': 0,
      'Amulet': 1, 'Ring': 2
    }
  },
  'Trophy': {typeId: 12},
  'UpgradeComponent': {
    typeId: 13, subTypes: {
      'Default': 0,
      'Gem': 1,
      'Rune': 2,
      'Sigil': 3
    }
  },
  'Weapon': { typeId: 14, subTypes: {
      'Axe': 0,
      'Dagger': 1,
      'Mace': 2,
      'Pistol': 3,
      'Scepter': 4,
      'Sword': 5,
      'Focus': 6,
      'Shield': 7,
      'Torch': 8,
      'Warhorn': 9,
      'Greatsword': 10,
      'Hammer': 11,
      'LongBow': 12,
      'Rifle': 13,
      'ShortBow': 14,
      'Staff': 15,
      'Harpoon': 16,
      'Speargun': 17,
      'Trident': 18,
      'LargeBundle': 19,
      'SmallBundle': 20,
      'Toy': 21,
      'TwoHandedToy': 22
    }
  }
}

var TypeLookupArray = [
  {  name: 'Armor', subTypes: ['Boots', 'Coat', 'Gloves', 'Helm',
    'HelmAquatic', 'Leggings', 'Shoulders']},
  {name: 'Back'},
  {name: 'Bag'},
  {
    name: 'Consumable', subTypes: ['AppearanceChange', 'Booze', 'ContractNpc', 'Food', 'Generic',
    'Halloween', 'Immediate', 'Transmutation', 'Unlock', 'UpgradeRemoval', 'Utility', 'TeleportToFriend']
  },
  {name: 'Container', subTypes: ['Default', 'GiftBox', 'OpenUI']},
  {name: 'CraftingMaterial'},
  {name: 'Gathering', subTypes: ['Foraging', 'Logging', 'Mining']},
  {name: 'Gizmo', subTypes: ['Default', 'ContainerKey', 'RentableContractNpc', 'UnlimitedConsumable']},
  {name: 'MiniPet'},
  {name: 'Tool'},
  {name: 'Trait'},
  {name: 'Trinket', subTypes: ['Accessory', 'Amulet', 'Ring']},
  {name: 'Trophy'},
  {name: 'UpgradeComponent', subTypes: ['Default', 'Gem', 'Rune', 'Sigil']},
  {
    name: 'Weapon', subTypes: ['Axe', 'Dagger', 'Mace', 'Pistol', 'Scepter', 'Sword', 'Focus', 'Shield',
    'Torch', 'Warhorn', 'Greatsword', 'Hammer', 'LongBow', 'Rifle', 'ShortBow', 'Staff', 'Harpoon', 'Speargun',
    'Trident', 'LargeBundle', 'SmallBundle', 'Toy', 'TwoHandedToy']
  },
]

function getItemTypeIdAndSubtypeId(type, details){
  var rv = {typeId: null, subTypeId: null};
  rv.typeId = TypeLookupHash[type].typeId;
  if(details != undefined && 'type' in details && 'subTypes' in TypeLookupHash[type]){

    rv.subTypeId = TypeLookupHash[type].subTypes[details.type];

  }
  return rv;

}

function getItemTypeAndSubType(typeId, subTypeId){
  var rv = {type: null, subType: null};
  rv.type = TypeLookupArray[typeId].name;
  if(subTypeId != null && 'subTypes' in TypeLookupHash[type]){
    rv.subType = TypeLookupHash[typeId].subTypes[subTypeId];
  }
  return rv;
}

function convertTypeHash2Array(typeHash) {
  // var returnArray = new Array(Object.keys(typeHash).length);
  var returnArray = [];

  for (var typeCounter = 0; typeCounter < Object.keys(typeHash).length; typeCounter++) {
    var typeObject = typeHash[Object.keys(typeHash)[typeCounter]];
    var newTypeObject = {};
    var subtypeArray = [];
    if (typeObject.subTypes != undefined) {
      for (var subtypeCounter = 0; subtypeCounter < Object.keys(typeObject.subTypes).length; subtypeCounter++) {
        var subtypeName = Object.keys(typeObject.subTypes)[subtypeCounter];
        var subtypeObj = {name: subtypeName, subtypeId: typeObject.subTypes[subtypeName]};
        subtypeArray[subtypeObj.subtypeId] = subtypeObj;

      }
      newTypeObject.typeId = typeObject.typeId;
      newTypeObject.name = Object.keys(typeHash)[typeCounter];
      newTypeObject.subTypes = subtypeArray;
    }
    returnArray[typeObject.typeId] = newTypeObject;
  }
  //console.log(returnArray);
  return returnArray;
}
