var debug = require('debug')('mongoose-datatables');

function dataTablesPlugin (schema, options) {
  schema.statics.dataTables = function (query, options, callback) {
    var thisSchema = this;
    var limit = parseInt(query.length, 10);
    var skip = parseInt(query.start, 10);
    var output = {
      recordsTotal: 0,
      recordsFiltered: 0,
      data: []
    };

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    var keys = options.keys || [];
    debug(options);

    var find = options.find || {};
    var sort = options.sort || {};

    if (query.search.value && options.search) {
      var arrSearch = options.search.split(" ");
      if (arrSearch.length == 1) {
        find[arrSearch[0]] = {'$regex': query.search.value, '$options': 'i'};
      } else if(arrSearch.length > 1) {
        find.$or = arrSearch.map(function (el){
          var obj = {};
          obj[el] = {'$regex': query.search.value, '$options': 'i'};
          return obj;
        });
      }
    }

    query.columns.forEach(function (colum) {
      if (colum.name) {
        keys.push(colum.name);
      }
    });

    debug(JSON.stringify(query,null,2));
    debug(JSON.stringify(find, null, 2));

    var getResults = function(done) {
      var query = thisSchema.find(find);
      query.select(keys.join(" "));
      query.skip(skip);
      query.limit(limit);
      query.sort(sort);
      if (options.populate) query.populate(options.populate);
      query.exec(done);
    };

    var countResults = function(done) {
      thisSchema.count(find, done);
    };

    var response = function (err, results) {
      if (err) {
        debug(err);
        callback(err);
      }

      output.recordsTotal = results[0];
      output.recordsFiltered = results[0];
      output.data = results[1];

      callback(err, output);
    };

    var parallel = function (fns, callback) {
      var results = [];
      var counter = fns.length;
      var error = null;

       fns.forEach(function (fn, i){
        fn(function (err){
          if (err) {
            error = err;
          }else {
            results[i] = arguments[1];
          }
          counter--;
          if (counter <= 0) {
            return callback(err, results);
          }
        });
      });
    };

    parallel([
      countResults,
      getResults
    ], response);
  };
}

module.exports = exports = dataTablesPlugin;