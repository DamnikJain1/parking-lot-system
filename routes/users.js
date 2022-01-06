const express = require('express');
const router = express.Router();
var mongo = require('mongodb');

const dbo = require('../db/mongo');


router.route("/list").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("user")
    .find({})
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching listings!");
     } else {
        res.json({count:result.length, data:result});
      }
    });

});


router.route("/login").get(async function (req, res) {
  const dbConnect = dbo.getDb();

  const uid = req.query.id;
  
  if(uid.length!=24){
    res.json({status: 'failure', msg:'invalid id'})
    return ;
  }

  var o_id = new mongo.ObjectID(uid);

  dbConnect
    .collection("user")
    .find({'_id': o_id})
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send({msg:'Error fetching listings!',err:err});
     } else {
        if(result.length>0){
          console.log("User logged in with id="+result._id);
          req.session.user = result[0];
          res.json({status: 'success', msg:'welcome '+result[0].name+'!', result:result[0]});
        }else{
          res.json({status: 'failure', msg:'userid not found'});          
        }
      }
    });

});


router.route("/create").post(async function (req, res) {
  const dbConnect = dbo.getDb();

  const userDocument = {
    name: req.body.name,
    isDifferentlyAbled: (req.body.isDifferentlyAbled === 'true'),
    isPregenant: (req.body.isPregenant === 'true'),
    gender: req.body.gender
  };

  dbConnect.collection("user")
    .insertOne(userDocument,function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send("Error inserting matches!");
      } else {
        userDocument._id = result.insertedId;
        req.session.user = userDocument;
        console.log(`Added a new user with id ${result.insertedId}`);
        res.json(req.session.user);
      }
    });

});

module.exports = router;
