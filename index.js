var fs = require('fs');
var glob = require('glob');
var path = require('path');
var optimist = require('optimist');
var async = require('async');
var flickr = require('flickr-with-uploads');

var argv = optimist
  .usage('Usage: $0 [-v] dir')
  .alias('h', 'help')
  .boolean('v')
  .options('v', {
    default: false,
    describe: 'show log'
  })
  .options('w', {
    alias: 'workers',
    default: 5,
    describe: 'number of parallel uploads'
  })
  .boolean('a')
  .options('a', {
    alias: 'auto-tags',
    describe: 'upload file /path/to/some/file.jpg with "path", "to", "some" tags'
  }).argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

var api = flickr('APP_KEY', 'APP_SECRET', 'USER_TOKEN', 'USER_SECRET');

function log(str){
  if (argv.v) {
    console.log(str);
  }
}
function error(str, status){
  console.error(str);
  process.exit(status);
}

function generateTags(file){
  return path.resolve(file).split('/').map(function(part){
    //if (!part) return '';
    return '"' + part + '"';
  }).join(' ');
}

function upload_file(file, done){
  log('process:'+file);
  var params = {
    method: 'upload',
    is_public: 0, is_friend: 0, is_family: 0,
    photo: fs.createReadStream(file)
  };
  if (argv.a) {
    params.tags = generateTags(file);
  }
  api(params, function(err, response) {
    if (err) {
      log('failed:'+file);
    } else {
      log('success:'+file);
    }
    done();
  });
}

var dir = argv._[0];
if (dir === undefined) {
  error('Directory argument missing', 1);
}
if (!fs.existsSync(dir)) {
  error('Can\'t open ' + dir, 2);
}
glob('**/*.{jpg,jpeg}', {cwd: dir, nocase: true}, function(err, files){
  if (err) {
    return error('glob error', 3);
  }
  async.mapLimit(files, argv.workers, function(file, done){
    upload_file(path.join(dir, file), done);
  }, function(){}); // see https://github.com/caolan/async/pull/357
});

