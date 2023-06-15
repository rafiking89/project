const express = require('express');
const { MongoClient } = require('mongodb');
const CryptoJS = require("crypto-js");
const path = require('path');
const {ValidateEmail, ValidatePass} = require('../common/funcs');
const router = express.Router();

const url = 'mongodb+srv://hhh9994:b2UzqTDUzVNrtWMo@cluster0.mgmdjkt.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'first';
const secret = 'blabla';

function emailCheck(email) {
  return query(function(collection) {
    return collection.findOne({ email: email, active: true });
  }, 'users')
    .then((result) => {
      if (result) {
        console.log('Email exists:', result.email);
        return true;
      } else {
        console.log('Email does not exist');
        return false;
      }
    })
    .catch((error) => {
      console.error('Error checking email:', error);
      return false;
    });
}


function userCheck(user) {
  return query(function(collection) {
    return collection.findOne({user: user, active: true });
  }, 'users')
    .then((result) => {
      if (result) {
        console.log('User exists:', result.user);
        return true;
      } else {
        console.log('User does not exist');
        return false;
      }
    })
    .catch((error) => {
      console.error('Error checking user', error);
      return false;
    });
}
async function query(func, table) {
  // Use connect method to connect to the server
  const client = new MongoClient(url);
  let findResult;
  try {
      // Connect to the MongoDB cluster
      await client.connect();
      console.log('Connected successfully to server');
      const db = client.db(dbName);
      const collection = db.collection(table);
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

router.get('/login', function(req, res) {
  return res.sendFile("./login.html", {root: "public/login/html"});
});
router.post('/login', function(req, res) {
  let err = {
    password: null,
    email: null,
    success: true
  };
  if(!ValidateEmail(req.body.params.email)){
    err.email = "Email not valid";
    err.success = false;
  }
  if(!ValidatePass(req.body.params.password)){
    err.password = "Password not valid";
    err.success = false;
  }
  if(err.success){
    query(function(collection){
      return collection.find({email: req.body.params.email, active: true}).limit(1).toArray();
    }, 'users')
    .then((results) => {
      if(results.length){
        let bytes  = CryptoJS.AES.decrypt(results[0].password, secret);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        if( originalText === req.body.params.password){
          let z = (new Date()).getTime().toString();
          let hash = CryptoJS.AES.encrypt(z, secret).toString()
          res.cookie('vl',hash, { maxAge: 1000*60*60*24*365, httpOnly: true });
          res.header('Access-Control-Allow-Credentials',true);
          res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
          );
          return res.send(JSON.stringify(true));
        } else {
          return res.send(JSON.stringify("Wrong password"));
        }
      } else {
        return res.send(JSON.stringify("Email not found"));
      }   
    })
    .catch((err) => {
      console.log(err);
      console.error;
      return res.send(JSON.stringify(err));
    });
  } else {
    return res.send(JSON.stringify(err));
  }
});
// aaAA11!!
router.get('/register', function(req, res) {
  // router.use(express.static("public"));
  return res.sendFile("register.html", {root: "public/register"});
});

router.get('/favorit', function(req, res) {
  query(function(collection){
    return collection.find({active: true}).toArray();
  }, 'users')
  .then((results) => {
    return res.send(JSON.stringify(results.map((item) => {
      return {
        
        img: item.img,
        age: item.age, 
        user: item.user
      };
    })));
  })
  .catch(() => {
    console.error;
  });
});


router.post('/favorit',  async function(req, res) {
    console.log(req.body);
    query(function(collection){
      return collection.find().sort({sid:-1}).limit(1).toArray();
    }, 'users')
    .then((results) => {
      // insert new user to the database
      query(function(collection){
        return collection.insertOne({
          
          img: req.body.params.img,
          age: req.body.params.age, 
          user: req.body.params.user,
          active: true
        });
      }, 'users')
      .then((results) => {
        console.log(results);
        return res.send(JSON.stringify(results));
      })
      .catch((err) => {
        console.log(err);
        console.error;
        return res.send(JSON.stringify(err));
      })
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
    }, 'users')
    .then((results) => {
      console.log(results);
      return res.send(JSON.stringify(results));
    })
    .catch((err) => {
      console.log(err);
      console.error;
      return res.send(JSON.stringify(err));
    });
  } else {
    return res.send(JSON.stringify(err));
  }
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
      }, 'users')
      .then((results) => {
        console.log(results);
        return res.send(JSON.stringify(results));
      })
      .catch((err) => {
        console.log(err);
        console.error;
        return res.send(JSON.stringify(err));
      })
  } else {
    return res.send(JSON.stringify(err));
  }
});

router.delete('/', function(req, res) {
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
    }, 'users')
    .then((results) => {
      if(results.length){
        let bytes  = CryptoJS.AES.decrypt(results[0].password, secret);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        if( originalText === req.body.password){
          query(function(collection){
            return collection.updateOne(
              {email: req.body.email, active: true},
              [{
                $set: { 
                  "active": false
                }
              }]
            );
          }, 'users')
          .then((results) => {
            console.log(results);
            return res.send(JSON.stringify(results));
          })
          .catch((err) => {
            console.log(err);
            console.error;
            return res.send(JSON.stringify(err));
          });
        } else {
          return res.send(JSON.stringify("Wrong password"));
        }
      } else {
        return res.send(JSON.stringify("Email not found"));
      }   
    })
    .catch((err) => {
      console.log(err);
      console.error;
      return res.send(JSON.stringify(err));
    });
  } else {
    return res.send(JSON.stringify(err));
  }
});
// router.delete('/', function(req, res) {
//   let err = {
//     email: null,
//     success: true
//   }
//   if(!ValidateEmail(req.body.email)){
//     err.email = "Email not valid";
//     err.success = false;
//   }
//   if(err.success){
//       query(function(collection){
//         return collection.updateOne(
//           {email: req.body.email, active: true},
//           [{
//             $set: { 
//               "active": false
//             }
//           }]
//         );
//       }, 'users')
//       .then((results) => {
//         console.log(results);
//         return res.send(JSON.stringify(results));
//       })
//       .catch((err) => {
//         console.log(err);
//         console.error;
//         return res.send(JSON.stringify(err));
//       })
//   } else {
//     return res.send(JSON.stringify(err));
//   }
// });

module.exports = router;










