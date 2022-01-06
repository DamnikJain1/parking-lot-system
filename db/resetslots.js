


function createNewSlots(dbConnection, callback){
	const currentSize = 
		dbConnection.collection("parkingSpace").count().then(async currentSize => {
		  const parkingLotSize = process.env.PARKING_LOT_SIZE;
		  var entries = [];
		  const n = parseInt(parkingLotSize,10)-parseInt(currentSize,10);
		  for (let i = 0; i < n ; i++) {
				let isReserved = false;
				let isOccupied = false;
				if(i<n/5){
				  isReserved = true;
				}
				
				entries.push({
				  parkingNumber: i+parseInt(currentSize,10)+1,
				  isOccupied: isOccupied,
				  isReserved: isReserved,
				  userId: null,
				  bookingTime: null
				});
		  }
		  if(entries.length>0)
				var r = await dbConnection.collection("parkingSpace").insertMany(entries);
		  console.log("Successfully connected to MongoDB.");    
		  console.log(entries.length+" parking space added");
		  callback();
		});  

}

module.exports = createNewSlots;