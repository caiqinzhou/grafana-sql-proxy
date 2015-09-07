var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var mysqlProxy = function(req, res, next) {
  var params = req.query;
  var sql = params.query.trim();
  var result = { "success": false, "results": [] };
  if (!(/^select/).test(sql)) {
      console.error("Sql is not clean: " + sql);
      res.json(result);
      return result;
  }
  var connection = mysql.createConnection({
    host     : params.host,
    user     : params.username,
    password : params.password,
    database : params.db
  });
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      res.json(result);
      return result;
    }
  });

  connection.query(params.query, function(err, rows, fields) {
    if (err) throw err;
    result.results = [{
      "series": [{
        "name" : "" ,
        "columns" : [] ,
        "values" : [] 
      }]
    }];
    var x, y;
//    console.log(rows);
//    console.log(fields);
    var columns = [];
    for ( x in fields) {
      columns.push(fields[x].name);
    }
    result.results[0].series[0].columns = columns;
    for ( x in rows) {
      var row = [];
      for ( y in rows[x]) {
        //console.log(y);
        //console.log(rows[x]);
        //console.log(rows[x][y]);
        row.push(rows[x][y]);
      }
      result.results[0].series[0].values.push(row);
    }
    console.log(result);
    result.success = true;
    res.json(result);
    return result;
  });
  connection.end();
}


/* GET users listing. */
router.get('/query', function(req, res, next) {
  //console.log(req.query);
  console.log(req);
  var result = mysqlProxy(req, res, next);
});

module.exports = router;
