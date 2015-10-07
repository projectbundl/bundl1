var express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');


app.listen(3001);

app.use('/', function(req, res) {
 res.render('index');      
});
