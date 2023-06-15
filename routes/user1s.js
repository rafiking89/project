const express = require('express');
const { MongoClient } = require('mongodb');
const CryptoJS = require("crypto-js");
const {ValidateEmail, ValidatePass} = require('../common/funcs');
const router = express.Router();
const cnt = 1000;

const url = 'mongodb+srv://hhh9994:b2UzqTDUzVNrtWMo@cluster0.mgmdjkt.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'first';
const secret = 'blabla';

async function query(func) {
  // Use connect method to connect to the server
  const client = new MongoClient(url);
  let findResult;
  try {
      // Connect to the MongoDB cluster
      await client.connect();
      console.log('Connected successfully to server');
      const db = client.db(dbName);
      const collection = db.collection('users');
      findResult = await func(collection);

  } catch (e) {
      console.error(e);
  } finally {
      // Close the connection to the MongoDB cluster
      await client.close();
      return findResult;
  }
}

/* GET users listing. */
router.get('/', function(req, res) {
  query(function(collection){
    return collection.find({active: true}).toArray();
  })
  .then((results) => {
    res.send(JSON.stringify(results.map((item) => {
      return {
        user: item.user, 
        email: item.email
      };
    })));
  })
  .catch(() => {
    console.error;
  });
  return;
});

router.post('/login', function(req, res) {
  let err = {
    password: null,
    email: null,
    success: true
  };
  if(!ValidateEmail(req.body.email)){
    err.email = "Email not valid";
    err.success = false;
  }
  if(!ValidatePass(req.body.password)){
    err.password = "Password not valid";
    err.success = false;
  }
  if(err.success){
    query(function(collection){
      return collection.find({email: req.body.email, active: true}).limit(1).toArray();
    })
    .then((results) => {
      if(results.length){
        let bytes  = CryptoJS.AES.decrypt(results[0].password, secret);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        if( originalText === req.body.password){
          res.send(JSON.stringify(true));
        } else {
          res.send(JSON.stringify("Wrong password"));
        }
      } else {
        res.send(JSON.stringify("Email not found"));
      }   
    })
    .catch((err) => {
      console.log(err);
      console.error;
      res.send(JSON.stringify(err));
    });
  } else {
    res.send(JSON.stringify(err));
  }
  return;
});

router.get('/register', function(req,res){
  //router.use(express.static("public"));
  return res.sendFile("register.html", {root: "public/register"});

});

router.get('/login', function(req,res){
  //router.use(express.static("public"));
  return res.sendFile("login.html", {root: "public/login"});

});


router.post('/login', function(req,res){
  //router.use(express.static("public"));
  

});



router.post('/register', function(req, res) {
 
  
      query(function(collection){
        return collection.insertOne({
          sid: results[0].sid + 1,
          user: req.body.params.user,
          email: req.body.params.email,
          password: CryptoJS.AES.encrypt(req.body.params.password, secret).toString(),
          active: true
        });
      })
      .then((results) => {
        console.log(results);
        return res.send(JSON.stringify(results));
      })
      .catch((err) => {
        console.log(err);
        // console.error;
        return res.send(JSON.stringify(err));
      })
  
});

router.put('/details', function(req, res) {
  let err = {
    user: null,
    email: null,
    newEmail: null,
    success: true
  }
  if(!ValidateEmail(req.body.email)){
    err.email = "Email not valid";
    err.success = false;
  }
  if(req.body.newEmail && !ValidateEmail(req.body.newEmail)){
    err.newEmail = "Email not valid";
    err.success = false;
  }
  if(req.body.user && req.body.user.length > 30){
    err.user = "User name to long";
    err.success = false;
  }
  if(err.success){
    query(function(collection){
      return collection.updateOne(
        {email: req.body.email, active: true},
        [{
          $set: { 
            "user" : req.body.user? req.body.user : "$user",
            "email" : req.body.user? "$email" : req.body.newEmail
          }
        }]
      );
    })
    .then((results) => {
      console.log(results);
      res.send(JSON.stringify(results));
    })
    .catch((err) => {
      console.log(err);
      console.error;
      res.send(JSON.stringify(err));
    });
  } else {
    res.send(JSON.stringify(err));
  }
  return;
});

router.put('/password', function(req, res) {
  let err = {
    password: null,
    rewpassword: null,
    email: null,
    success: true
  }
  if(!ValidateEmail(req.body.email)){
    err.email = "Email not valid";
    err.success = false;
  }
  if(!ValidatePass(req.body.password)){
    err.password = "Password not valid";
    err.success = false;
  }
  if(!ValidatePass(req.body.repassword) || req.body.repassword != req.body.password){
    err.repassword = "Validation password not valid";
    err.success = false;
  }
  if(err.success){
      query(function(collection){
        return collection.updateOne(
          {email: req.body.email, active: true},
          [{
            $set: { 
              "password": CryptoJS.AES.encrypt(req.body.password, secret).toString()
            }
          }]
        );
      })
      .then((results) => {
        console.log(results);
        res.send(JSON.stringify(results));
      })
      .catch((err) => {
        console.log(err);
        console.error;
        res.send(JSON.stringify(err));
      })
  } else {
    res.send(JSON.stringify(err));
  }
  return;
});

router.delete('/', function(req, res) {
  let err = {
    email: null,
    success: true
  }
  if(!ValidateEmail(req.body.email)){
    err.email = "Email not valid";
    err.success = false;
  }
  if(err.success){
      query(function(collection){
        return collection.updateOne(
          {email: req.body.email, active: true},
          [{
            $set: { 
              "active": false
            }
          }]
        );
      })
      .then((results) => {
        console.log(results);
        res.send(JSON.stringify(results));
      })
      .catch((err) => {
        console.log(err);
        console.error;
        res.send(JSON.stringify(err));
      })
  } else {
    res.send(JSON.stringify(err));
  }
  return;
});

module.exports = router;










