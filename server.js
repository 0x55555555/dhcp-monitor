var express = require('express');
var macvendor = require('macvendor');
var ping = require ("net-ping");
var app = express();

app.use(express.static('www'));

app.get("/ping", function(req, res){
  var ip = req.query.ip;

  var session = ping.createSession();
  session.pingHost (ip, function (error, target, sent, rcvd) {
    if (error) {
      res.end(error.message);
      return;
    }

    var ms = rcvd - sent;
    res.end(ms.toString() + "ms");
  });
});

app.get("/getmac", function(req, res){
  macvendor(req.query.mac, function(err, vendor) {
    console.log (vendor);
    res.end(vendor);
  });
});

app.get('/data', function (req, res) {
  var http = require('http');
  var fs = require('fs');
  var dhcpdleases = require('dhcpd-leases');

  fs.readFile( '/var/lib/dhcp/dhcpd.leases', function(error, data) {
    if (error) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        'error':'Server error',
        'message':error
      }));
    }
    else {
      var leases = fs.readFileSync('/var/lib/dhcp/dhcpd.leases', 'utf-8');
      var data = dhcpdleases(leases);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    }
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('DHCP server listening at http://%s:%s', host, port);
});
