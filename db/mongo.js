const { MongoClient } = require("mongodb");
const connectionString = process.env.ATLAS_URI;

const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const createNewSlots = require("./resetslots");

let dbConnection;

client.connect(err => {
  dbConnection = client.db("test");
  createNewSlots(dbConnection, function(){
    setInterval(async () => checkForVacantSlots(), 1000);
  }); 
});

async function checkForVacantSlots() {
  try {
    // const dbConnect = dbo.getDb();
    let currentDate = new Date();
    currentDate = new Date(currentDate-process.env.MAX_WAIT_PER_SLOT_IN_MINS*60*1000);

    const query = {bookingTime: {$lte: currentDate}};
    const options = { "upsert": false }

    const update = { 
        $set : {
          isOccupied: false,
          userId: null,
          bookingTime: null
        }
      };

    dbConnection
      .collection("parkingSpace")
      .updateMany(query , update, (err , collection) => {
        if(err) throw err;
        if(collection.modifiedCount!=0)
          console.log(collection.modifiedCount + " slot(s) timed out and were marked vacant");
      });

  } catch (err) {
    console.log(err);
  }

}


module.exports = {
  getDb: function () {
    return dbConnection;
  },
};