/**
 * Module dependencies
 */

var util = require('util');
var path = require('path');
var _ = require('lodash');



/**
 * sails-generate-hook
 *
 * Usage:
 * `sails generate hook`
 *
 * @description Generates a hook
 * @help See http://links.sailsjs.org/docs/generators
 */

module.exports = {

  /**
   * `before()` is run before executing any of the `targets`
   * defined below.
   *
   * This is where we can validate user input, configure default
   * scope variables, get extra dependencies, and so on.
   *
   * @param  {Object} scope
   * @param  {Function} cb    [callback]
   */

  before: function (scope, cb) {

    // scope.args are the raw command line arguments.
    //
    // e.g. if someone runs:
    // $ sails generate hook user find create update
    // then `scope.args` would be `['user', 'find', 'create', 'update']`
    if (!scope.args[0]) {
      return cb( new Error('Please provide a name for this hook.') );
    }

    // scope.rootPath is the base path for this generator
    //
    // e.g. if this generator specified the target:
    // './Foobar.md': { copy: 'Foobar.md' }
    //
    // And someone ran this generator from `/Users/dbowie/sailsStuff`,
    // then `/Users/dbowie/sailsStuff/Foobar.md` would be created.
    if (!scope.rootPath) {
      return cb( INVALID_SCOPE_VARIABLE('rootPath') );
    }


    // Attach defaults
    _.defaults(scope, {
      createdAt: new Date()
    });

    // Decide the output id for use in targets below:
    scope.id = scope.args[0];

    // When finished, we trigger a callback with no error
    // to begin generating files/folders as specified by
    // the `targets` below.
    return cb();
  },



  /**
   * The files/folders to generate.
   * @type {Dictionary}
   */

  targets: {
    './api/hooks/:id/index.js': { template: 'index.js.template' }
  },


  /**
   * The absolute path to the `templates` for this generator
   * (for use with the `template` helper)
   *
   * @type {String}
   */
  templatesDirectory: path.resolve(__dirname, './templates')

};





/**
 * INVALID_SCOPE_VARIABLE()
 *
 * Utility function to put together a nice error about a missing or invalid
 * scope variable. We should always validate any required scope variables
 * to avoid inadvertently smashing someone's filesystem.
 *
 * @param {String} varname [the name of the missing/invalid scope variable]
 * @param {String} details [optional - additional details to display on the console]
 * @param {String} message [optional - override for the default message]
 * @return {Error}
 * @api private
 */

function INVALID_SCOPE_VARIABLE (varname, details, message) {
  var DEFAULT_MESSAGE =
  'Issue encountered in generator "hook":\n'+
  'Missing required scope variable: `%s`"\n' +
  'If you are the author of `sails-generate-hook`, please resolve this '+
  'issue and publish a new patch release.';

  message = (message || DEFAULT_MESSAGE) + (details ? '\n'+details : '');
  message = util.inspect(message, varname);

  return new Error(message);
}