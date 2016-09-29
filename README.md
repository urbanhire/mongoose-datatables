# mongoose-datatables

Mongoose Datatables plugin refactored

[![Build Status](https://travis-ci.org/archr/mongoose-datatables.svg)](https://travis-ci.org/archr/mongoose-datatables)

## Installation
```sh
$ npm i --save https://github.com/urbanhire/mongoose-datatables#staging
```

## Configuration
plugin(schema)

```javascript
'use strict'

var db = require('mongoose')
const dataTables = require('mongoose-datatables')

var Position = new db.Schema({
  ...omitted
})

Position.plugin(dataTables)

db.model('Position', Position)

module.exports = Position

```

## Usage
dataTable(parmas, callback)

The available parmas are:
* `limit` (Number) - Specifies mongo limit.
* `skip` (Number) - Specifies mongo skip.
* `find` (Object) - Specifies selection criteria.
* `select` (Object) - Specifies the fields to return.
* `sort` (Object) - Specifies the order in which the query returns matching documents.
* `search` (Object) - Search.
* `populate` (Object) - Specifies models to populate.


```javascript
app.get('/api', (req, res, next) => {
  Position
    .dataTables({
      limit: limit, // Number
      sort: sortQuery, // {'name' : 'ascending'}
      find: query, // {''}
      skip: skip,
      populate: [{path:'company', select:'name'}],
      select: 'name slug company'
    },
    (err, positions) => {
      if (err) return res.status(500).send('Internal Server Error')
      else {
        return res.status(200).json(positions)
      }
    })
})
```