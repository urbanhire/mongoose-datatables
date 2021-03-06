const _ = require('lodash')
const async = require('async')

module.exports = function dataTablesPlugin (schema) {
  
  schema.statics.dataTables = function (params, callback) {
    var thisSchema = this
    var limit = parseInt(_.result(params, 'limit'), 10)
    var skip = parseInt(_.result(params, 'skip'), 10)

    var select = _.result(params, 'select') || {}
    var find = _.result(params, 'find') || {}
    var sort = _.result(params, 'sort') || {}
    var search = _.result(params, 'search') || {}

    if (search && _.every(['value', 'fields'], _.partial(_.has, search))) {
      var searchQuery = {
        '$regex': _.result(search, 'value'),
        '$options': 'i'
      }
      var searchFields = _.result(search, 'fields')

      if (_.size(searchFields) === 1) {
        find[_.head(searchFields)] = searchQuery
      } else if(_.size(searchFields) > 1) {
        find['$or'] = find['$or'] || []
        _.forEach(searchFields, (field) => {
          var obj = {}
          obj[el] = searchQuery
          find['$or'].push(obj)
        })
      }
    }
    console.log('async parallel', find, sort, search, select)
    async.parallel({
      data: (cb) => {
        var query = thisSchema
          .find(find)
          .select(select)
          .skip(skip)
          .limit(limit)
          .sort(sort)

        if (params.populate) {
          query.populate(params.populate)
        }
        query.exec((err, result) => {
          cb(err, result)
        })
      },
      total: (cb) => {
        thisSchema.count(find, (err, count) => {
          cb(err, count)
        })
      }
    }, callback)
  }
}



