
/*require.scopes["io"] = (function() {

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

})();*/




/*
 * This file is part of Adblock Plus <http://adblockplus.org/>,
 * Copyright (C) 2006-2014 Eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */
//
// This file has been generated automatically, relevant repositories:
// * https://hg.adblockplus.org/jshydra/
//
require.scopes["io"] = (function () {

    var getFromStorage, saveToStorage;

    getFromStorage = function(key, callback) {
      console.log('  >>> getFromStorage', key, key == 'patterns.ini');
      if (key == 'patterns.ini') {
        var request = new XMLHttpRequest();
        request.open("GET", "patterns.ini");
        request.addEventListener("load", function() {
          console.log('  >>> getFromStorage patterns.ini -> ', request.responseText.length);
          callback(null, request.responseText.split('\n').slice(0, 100000).join('\n'));
        });
        request.addEventListener("error", function(err) {
          console.log('XHR to load patterns.ini ERROR', arguments);
          callback(err);
        }, false);
        request.send(null);
        //saveToStorage();
      } else {
        return chrome.storage.local.get(key, function(items) {
          return callback(null, items[key]);
        });
      }
    };

    saveToStorage = function(key, val, callback) {
      var obj;
      obj = {};
      obj[key] = val;
      return chrome.storage.local.set(obj, function() {
        return typeof callback === "function" ? callback() : void 0;
      });
    };
  

    var exports = {};

    var IO = exports.IO = {

        _getFileEntry: function (file, create, successCallback, errorCallback) {
            if (file instanceof FakeFile) {
                file = file.path;
            } else if ("spec" in file) {
                file = file.spec;
            }
            file = file.replace(/^.*[\/\\]/, "");

            //var rfs = (window.requestFileSystem || window.webkitRequestFileSystem);

            return successCallback({fs_mock: true}, {path: file});

            /*
            rfs(window.PERSISTENT, 1024 * 1024 * 1024, function (fs) {
              fs.root.getFile(file, {create: create}, function (fileEntry) {
                successCallback(fs, fileEntry);
              }, errorCallback);
            }, errorCallback);
            */

            console.log('fs _getFileEntry end');
        },


        lineBreak: "\n",


        resolveFilePath: function (path) {
          return new FakeFile(path);
        },


        readFromFile: function (file, listener, callback, timeLineID) {
            console.log('IO readFromFile', file);
            var path;
            if (typeof(file) === 'string') {
              path = file;
            } else {
              path = file.path;
            }
            getFromStorage(path, function(err, content) {
              console.log('readFromFile >> getFromStorage', content.length)
              content = content || '';
              var lines = content.split(/[\r\n]+/);

              function processBatch(index, lines, callback) {
                console.log('processing batch', index, "out of", lines.length);
                for (var i=0; i<500; ++i) {
                  if (i + index >= lines.length) break;
                  listener.process(lines[i + index]);
                }
                if (index + i >= lines.length) {
                  console.log('  >>> parser (listener) subscription[0]', listener.subscriptions[0].filters.length);
                  listener.process(null);
                  return callback();
                } else {
                  setTimeout(function() {
                    processBatch(i+index, lines, callback);
                  }, 0);
                }
              }

              processBatch(0, lines, callback);

              /*
              for (var i = 0; i < lines.length; ++i) {
                listener.process(lines[i]);
              }
              listener.process(null);
              callback(null);*/
            });
            return;
            /*
            if (typeof file == "string") {
                var Utils = require("utils")
                    .Utils;
                Utils.runAsync(function () {
                    var lines = file.split(/[\r\n]+/);
                    for (var i = 0; i < lines.length; i++) {
                        listener.process(lines[i]);
                    }
                    listener.process(null);
                    callback(null);
                }.bind(this));
                return;
            }
            this._getFileEntry(file, false, function (fs, fileEntry) {
                fileEntry.file(function (file) {
                    if (file.size == 0) {
                        callback("File is empty");
                        return;
                    }
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        if (reader.error) {
                            callback(reader.error);
                        } else {
                            var lines = reader.result.split(/[\r\n]+/);
                            for (var i = 0; i < lines.length; i++) {
                                listener.process(lines[i]);
                            }
                            listener.process(null);
                            callback(null);
                        }
                    };
                    reader.readAsText(file);
                }, callback);
            }, callback);
            */
        },


        writeToFile: function (file, data, callback, timeLineID) {
            console.log('IO writeToFile', file);
            var path;
            if (typeof(file) === 'string') {
              path = file;
            } else {
              path = file.path;
            }
            saveToStorage(path, data, function() {
              callback(null);
            });

            return;

            /*
            this._getFileEntry(file, true, function (fs, fileEntry) {
                fileEntry.createWriter(function (writer) {
                    var executeWriteOperation = function (op, nextOperation) {
                        writer.onwriteend = function () {
                            if (writer.error) {
                                callback(writer.error);
                            } else {
                                nextOperation();
                            }
                        }.bind(this);
                        op();
                    }.bind(this);
                    var blob;
                    try {
                        blob = new Blob([data.join(this.lineBreak) + this.lineBreak], {
                            type: "text/plain"
                        });
                    } catch (e) {
                        if (!(e instanceof TypeError)) {
                            throw e;
                        }
                        var builder = new window.BlobBuilder || window.WebKitBlobBuilder();
                        builder.append(data.join(this.lineBreak) + this.lineBreak);
                        blob = builder.getBlob("text/plain");
                    }
                    executeWriteOperation(writer.write.bind(writer, blob),
                        function () {
                            executeWriteOperation(writer.truncate.bind(
                                    writer, writer.position),
                                callback.bind(null, null));
                        });
                }.bind(this), callback);
            }.bind(this), callback);
            */
        },


        copyFile: function (fromFile, toFile, callback) {
            console.log('IO copyFile');
            var data = [];
            this.readFromFile(fromFile, {
                process: function (line) {
                    if (line !== null) {
                        data.push(line);
                    }
                }
            }, function (e) {
                if (e) {
                    callback(e);
                } else {
                    this.writeToFile(toFile, data, callback);
                }
            }.bind(this));
        },


        renameFile: function (fromFile, newName, callback) {
            console.log('IO renameFile');
            throw new Error('renameFile not implemented!');
            this._getFileEntry(fromFile, false, function (fs, fileEntry) {
                fileEntry.moveTo(fs.root, newName, function () {
                    callback(null);
                }, callback);
            }, callback);
        },


        removeFile: function (file, callback) {
            console.log('IO removeFile');
            throw new Error('removeFile not implemented!');
            this._getFileEntry(file, false, function (fs, fileEntry) {
                fileEntry.remove(function () {
                    callback(null);
                }, callback);
            }, callback);
        },


        statFile: function (file, callback) {
            console.log('IO statFile', file);

            var path;
            if (typeof(file) === 'string') {
              path = file;
            } else {
              path = file.path;
            }

            getFromStorage(path, function(data) {
              if ( ! data) {
                return callback({
                  exists: false,
                  isDirectory: false,
                  isFile: true,
                  lastModified: 0
                });
              } else {
                return callback({
                  exists: true,
                  isDirectory: false,
                  isFile: true,
                  lastModified: 0
                });
              }
            });
            return;

            // Will not get here...

            if (typeof file.path == "string") {
                var Utils = require("utils")
                    .Utils;
                Utils.runAsync(callback.bind(null, null, {
                    exists: true,
                    isDirectory: false,
                    isFile: true,
                    lastModified: 0
                }));
                return;
            }
            require("utils")
                .Utils.runAsync(function () {
                    console.log('IO statFile, before _getFileEntry');
                    this._getFileEntry(file, false, function (fs, fileEntry) {
                        console.log(
                            'IO statFile, after _getFileEntry, before fileEntry.getMetadata'
                        );
                        fileEntry.getMetadata(function (metadata) {
                            callback(null, {
                                exists: true,
                                isDirectory: fileEntry.isDirectory,
                                isFile: fileEntry.isFile,
                                lastModified: metadata.modificationTime
                                    .getTime()
                            });
                        }, callback);
                    }, callback);
                }.bind(this));
        }
    };


    console.log('IO done');


    return exports;
})();
