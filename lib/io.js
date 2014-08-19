
require.scopes["io"] = (function() {

  var exports = {};

  var IO = exports.IO = {
    _getFileEntry: function(file, create, successCallback, errorCallback) {
      return successCallback(true);
    },

    lineBreak: "\n",

    resolveFilePath: function(path) {
      console.log('resolveFilePath', path);
      return path;
    },

    readFromFile: function(file, listener, callback, timeLineID) {
      console.log('readFromFile', file, arguments);
      return
    },

    writeToFile: function() {},
    copyFile: function() {},
    renameFile: function() {},
    removeFile: function() {},
    statFile: function() {},
  };

  return exports;

})();
