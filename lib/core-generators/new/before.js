/**
 * Module dependencies
 */

var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var flaverr = require('flaverr');


/**
 * before()
 *
 * Runs before this generator begins processing targets.
 *
 * @param  {Dictionary} scope
 * @param  {Function} done
 */

module.exports = function before (scope, done) {

  var args0 = scope.args[0];

  // Use a reasonable default app name
  var defaultAppName = args0;

  // Ensure that default app name is not "." or "" and does not contain slashes.
  if (defaultAppName === '.' || defaultAppName === './' || !defaultAppName) {
    defaultAppName = path.basename(process.cwd());
  }
  defaultAppName = defaultAppName.replace(/\//, '-');


  var author = process.env.USER || 'anonymous node/sails user';

  var owner = author;

  _.defaults(scope, {

    // Specific to new Sails apps
    appName: defaultAppName,
    linker: true,
    adapter: 'sails-disk',
    without: [],

    // Generic
    // (for any generated Node package)
    author: author,
    owner: owner,
    year: (new Date()).getFullYear(),
    github: {
      username: author,
      owner: owner
    },
    modules: {},
    website: util.format('https://github.com/%s', owner)
  });



  // Expand `without` into an array.
  // (assumes it is a comma-separated list)
  if (_.isString(scope.without)) {
    scope.without = scope.without.split(',');

    // Strip empty strings just in case there is a trailing comma.
    scope.without = _.without(scope.without, '');

  }//>-

  // Validate `without`
  if (!_.isArray(scope.without)) {
    return done(new Error('Couldn\'t create a new Sails app.  The provided `without` option (`'+util.inspect(scope.without, {depth:null})+'`) is invalid.'));
  }//-•

  // Reject unrecognized "without" entries
  var LEGAL_WITHOUT_IDENTIFIERS = ['lodash', 'async', 'orm', 'sockets', 'grunt'];
  var unrecognizedEntries = _.difference(scope.without, LEGAL_WITHOUT_IDENTIFIERS);
  if (unrecognizedEntries.length > 0) {
    return done(new Error('Couldn\'t create a new Sails app.  The provided `without` option contains '+(unrecognizedEntries.length===1?'an':unrecognizedEntries.length)+' unrecognized entr'+(unrecognizedEntries.length===1?'y':'ies')+': '+unrecognizedEntries));
  }//-•


  // ----------------------------------------------------------------------------------------
  // TODO: finish actually supporting the rest of these `without` entries
  // (so far only lodash and async work)
  // ----------------------------------------------------------------------------------------


  // Don't include the homepage if this is being generated without `orm` or `sockets`.
  // Note that the default homepage doesn't mention Grunt, so no need to worry about that.
  //
  // > FUTURE: do a different, stripped-down homepage instead.
  if (_.contains(scope.without, 'orm') || _.contains(scope.without, 'sockets')) {
    scope.modules.homepage = false;
  }//-•



  // --------------------------------------------------------------------------------------------------------------
  // > FUTURE: convert this to work based on `--without` instead (e.g. you'd be able to do --without=lodash,async,frontend)
  // (but note this generator needs to be grepped for the word "frontend" first - there are other places in here where `scope.frontend` is used!!!)

  // Alias for `--no-front-end` or `--front-end`
  // (instead of "--no-frontend" or "--frontend")
  if (!_.isUndefined(scope['front-end'])) {
    scope.frontend = scope['front-end'];
    delete scope['front-end'];
  }

  // If this is an app being generated with `--no-frontend` (which is equivalent
  // to `--frontend=false`), then disable some of our targets.
  //
  if (scope.frontend === false) {
    scope.modules.frontend = false;
    scope.modules.gruntfile = false;
    scope.modules.views = false;
  }//>-
  // --------------------------------------------------------------------------------------------------------------


  // Make changes to the rootPath where the sails project will be created
  scope.rootPath = path.resolve(process.cwd(), args0 || '');

  // Ensure there aren't any insurmountable conflicts at the generator's root path.
  // > This is so that we don't inadvertently delete anything, unless the `force`
  // > flag was enabled.
  (function _ensureNoInsurmountableConflictsAtRootPath(proceed){

    // Try to read a list of the direct children of this directory.
    var dirContents;
    try {

      dirContents = fs.readdirSync(scope.rootPath);

    }
    catch (err_fromReadDirSync) {

      switch (err_fromReadDirSync.code) {

        // If the directory doesn't exist, no sweat.  (We'll keep going.)
        case 'ENOENT':
          return proceed();

        // If the target path is actually a file, instead of a directory,
        // then we'll check to see if the `force` flag was enabled.  If not,
        // then we'll bail with a fatal error.  But if `force` WAS enabled,
        // then we'll go ahead and continue onwards.
        case 'ENOTDIR':
          if (scope.force) {
            return proceed();
          }//-•
          return proceed(flaverr('alreadyExists', new Error('Couldn\'t create a new Sails app at "'+scope.rootPath+'" because something other than an empty directory already exists at that path.')));

        // Otherwise, there was some other issue, so bail w/ a fatal error.
        default:
          return proceed(new Error('Couldn\'t create a new Sails app at "'+scope.rootPath+'" because an unexpected error occurred: '+err_fromReadDirSync.stack));

      }//</switch :: err_fromReadDirSync.code>
    }//</catch :: err_fromReadDirSync>

    //--•
    // If this directory is empty, then we're good.
    if (dirContents.length === 0){
      return proceed();
    }

    //--•
    // But otherwise, this directory is NOT empty.

    // If the `force` flag is enabled, we can proceed.
    // (Otherwise we have to fail w/ a fatal error.)
    if (scope.force) {
      return proceed();
    } else { return proceed(flaverr('alreadyExists', new Error('Couldn\'t create a new Sails app at "'+scope.rootPath+'" because a non-empty directory already exists at that path.'))); }

  })(function (err){
    if (err) {
      switch (err.code) {
        case 'alreadyExists': return done(err);
        default: return done(err);
      }
    }

    return done();

  });//</self-calling function :: ensure there aren't any insurmountable conflicts at the generator's root path>

};
