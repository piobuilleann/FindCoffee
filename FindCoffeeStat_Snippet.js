var express = require('express');
var router = express.Router();
var coffeeModel = require('../models/CoffeeModel');
/*
 *
 *		Coffee Model Example
 *
 *
 *
 *		{
 *			id: 1,
 *			name: "Third Culture Coffee",
 *			location: "80 102nd Ave NE",
 *			price: "4.4",
 *			rating: "4.8",
 *			lat: "47.62771",
 *			lon: "-122.204515",
 *			img: "path",
 *			DistanceFromUser: "1.34" 
 *		}
 *
 */



/* 
 *		GET  Coffee Shops
 *		AJAX
 *		RETURNS: JSON
 *
 */
router.get('/get/coffee', function(req, res, next) {
	var usrLat = req.params.lat;
	var usrLon = req.params.lon;
	var usrScreenResHeight = req.params.screenResHeight;
	var usrScreenResWidth = req.params.screenResWidth;
	var orderBy = req.params.orderBy;
	var coffeshops;
	
	//check for error
	try{
		//get coffee shops close to the area of user
		coffeshops = await coffeeModel.getRegionalCoffeeShops({
			lat: usrLat,
			lon: usrLon
		});
	} catch(error) {
		return res.status(400).json( {error: error.toString()} ) ;
	}
	
	//Given a list of coffee shops
	//coffeshops
	
	// define the distance of each coffee shop to the user within the coffeeshops object
	for(var i=0; i < coffeshops.length; i++){
		coffeshops[i].DistanceFromUser = CalculateDistance(usrLat, usrLon, coffeshops[i].lat, coffeshops[i].lon);
	}
	
	
	
	//now that we have all the distances of the coffee shops from the user we must order all of the shops relative to the user (ordered by distance) UNLESS the user has defined a different order.
	switch(orderBy) {
	  case "price":
		// sort coffee shops by price
		coffeshops.sort(function(a,b) {return (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0);} );
		break;
	  case "rating":
		// sort coffee shops by rating
		coffeshops.sort(function(a,b) {return (a.rating > b.rating) ? 1 : ((b.rating > a.rating) ? -1 : 0);} );
		break;
	  default:
		// sort coffee shops by distance
		coffeshops.sort(function(a,b) {return (a.DistanceFromUser > b.DistanceFromUser) ? 1 : ((b.DistanceFromUser > a.DistanceFromUser) ? -1 : 0);} );
	} 	
	
	/*
	 *
	 *		Where X is a configurable number determined by the screen size of your phone
	 *		We'll  do this linearly
	 *
	 *		300x450 = 135,000
	 *		1920 x 1080 = 207,360
	 *
	 *
	 *		100,000 (y)  =>   5 locations (x) (coffee shops)
	 *		200,000 (y)  =>   18 locations (x)
	 *
	 *		m = 100,000 / 13
	 *
	 *		x = ( (y-61,538.47) / ( 100,000/13) )
	 */
	var limitingShopsOnResolution = ( (( usrScreenResHeight * usrScreenResWidth )-61,538.47) / ( 100,000/13) );
	//Where X is a configurable number determined by the screen size of your phone
	coffeshops = coffeshops.slice(0, Math.round(limitingShopsOnResolution) );

	// set proper headers and send json
    res.setHeader('Content-Type', 'application/json');
    res.end( JSON.stringify(coffeshops) );	
});

module.exports = router;


