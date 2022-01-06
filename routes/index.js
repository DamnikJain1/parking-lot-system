const express = require('express');
const router = express.Router();

router.route("/").get(function (req, res) {
  res.json({
    name:"Parking System",
    description:"System to book parking slots and manage parking space"});
});

module.exports = router;
