var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
  return res.sendFile("./index.html", {root: "public/home"});
  
});


router.get('/login', function(req, res) {
  return res.sendFile("./login.html", {root: "public/login/html"});
});

router.get('/register', function(req, res) {
  return res.sendFile("./register.html", {root: "public/register/"});
});
module.exports = router;
