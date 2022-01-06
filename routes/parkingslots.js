const express = require('express');
const router = express.Router();
var mongo = require('mongodb');

const dbo = require('../db/mongo');
const createNewSlots = require('../db/resetslots');

function getParkingSpaceDetails(req, res, query){
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("parkingSpace")
    .find(query)
    .toArray(function (err, result) {
      if (err) {
        res.send("Error fetching listings!");
     } else {
        res.json({count:result.length, data:result});
      }
    });
}

router.route("/available").get(function (req, res) {
  const query = {isOccupied: false};
  getParkingSpaceDetails(req, res, query);
});


router.route("/occupied").get(function (req, res) {
  const query = {isOccupied: true};
  getParkingSpaceDetails(req, res, query);
});

router.route("/reset").get(async function (req, res) {
  const dbConnect = dbo.getDb();
  try {
    await dbConnect.collection("parkingSpace").deleteMany({});  
  }catch (exception_var) {}
  await createNewSlots(dbo.getDb(), function(){});
  res.json({msg:"reset parking slots completed"});
});

function bookParkingSlot(req, res, find, updateFields){
  const dbConnect = dbo.getDb();

    dbConnect
    .collection("parkingSpace")
    .findOneAndUpdate(find, updateFields, {  returnDocument: 'after' }, 
      function(err, result){
        if(err){
          if(
            (req.session.user.isPregenant && req.session.user.gender=='female')
              || req.session.user.isDifferentlyAbled){
              //to retry allotment
              console.log("retrying!");
              bookParkingSlot(req, res, {isOccupied: false}, updateFields);
              return "exit";
          }
          
          res.json({status:"no vacant slots"});
          return "exit";
        }

        if(result.value)
          res.json({status:'booked',
                numberOfSlotBooked: result.ok,
                parkingNumber: result.value.parkingNumber,
                bookingTime: result.value.bookingTime});
        else
          res.json({status:"no vacant slots"});
        return "exit";
    });

}

router.route("/book").get(function (req, res) {
  if(!req.session.user){
    res.json({msg:"user not logged in, kindly login and retry"});
    return;
  }

  const find = { isOccupied: false };
  if (
    (req.session.user.isPregenant && req.session.user.gender=='female')
      || req.session.user.isDifferentlyAbled) {
    find.isReserved = true;
  }else{
    find.isReserved = false;
  }

  const updateFields = {
    $set: {
      userId: req.session.user,
      bookingTime: new Date(),
      isOccupied: true
    },
  };

  bookParkingSlot(req, res, find, updateFields);

});

module.exports = router;
