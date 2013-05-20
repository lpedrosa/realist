if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /* , from */)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

function postToNewWindow(url, params, target) {
	var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute("target", target);

    for ( var key in params ) {
        if ( params.hasOwnProperty(key) ) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            if(params[key] == null)
            	hiddenField.setAttribute("value", "");
            else
            	hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    
    currentBrowser = BrowserDetect.browser;
    if(currentBrowser != "Chrome" && currentBrowser != "Safari")
    	wopen("", target, 888, 590);
    	
    form.submit();
}

/***************************
 * 
 * View Model Helpers
 * 
 ***************************/

function FlightDeal() {
	var self = this;
	self.wasViewed = ko.observable(false);
	self.compoundTripId = '';
	self.cheapestPrice = 0;
	self.cheapestResult = ko.observable();
	/*self.legs = [
	     	    { origin:{ name:'', code:'' }, destination:{ name:'', code:'' }, departureTime:{ time:-1 } },
	     	    { departureTime:{ time:-1 } }
	     	];*/
	self.legs = [];
	self.airlines = [];
	self.flightResults = ko.observableArray();
	self.deepLink;
	
	self.addFlightResult = function(data) {
		flightResult = new FlightResult();
		flightResult.price = data.price;
		flightResult.provider = data.provider;
		flightResult.deepLink = data.deepLink;
		
		// there is no cheapest price yet
		if(self.cheapestPrice == 0) {
			self.cheapestPrice = parseInt(flightResult.price.amount);
			self.cheapestResult = ko.observable(flightResult); 
		} else if(self.cheapestPrice > flightResult.price.amount) {
			// the new price is cheaper
			self.flightResults.push(self.cheapestResult());
			self.cheapestPrice = flightResult.price.amount;
			self.cheapestResult = ko.observable(flightResult);
		} else {
			// the new price is the same or not cheaper
			self.flightResults.push(flightResult);
		}
			
	}
	
	self.hasMoreProviders = function() {
		return self.flightResults().length > 0 ? true : false;
	}
	
	self.getRemainingAirlinesForLeg = function(legNumber) {
		airlineString = 'Airlines:';
		for(var i=0; i< self.legs[legNumber].airlines.length; i++) {
			airlineString += ' ' + self.legs[legNumber].airlines[i].name;
		}
		return airlineString;
	}
}

function FlightResult() {
	var self = this;
	self.price = { amount:0, symbol:'&pound;' };
	self.provider = { supplier:{ id:'' }, name: '' };
	self.deepLink;
}


//*************
// Filter Chain logic
//*************
function FilterChain() {
	var self = this;
	self.filters = new Object();
	
	self.needsRestartFilters = function(filter) {
		filterInChain = self.filters[filter.name]; 
		if(filterInChain && !filter.shrunk(filterInChain)) {
			self.filters[filter.name] = filter;
			return true;
		} else
			self.filters[filter.name] = filter;
		return false;
	}
	
	self.getFilterCallbacks = function() {
		filterCallbacks = new Array();
		for (var key in self.filters) {
			  if (self.filters.hasOwnProperty(key)) {
				  filterCallbacks.push(self.filters[key].callback);
			  }
		}
		return filterCallbacks;
	}
}

/***************************
 * 
 * Filters
 * 
 ***************************/

function PriceFilter(min,max) {
	var self = this;
	self.name = "priceFilter";
	self.min = min;
	self.max = max;
	self.callback = function(item) {
			return item.cheapestPrice >= self.min*100 && item.cheapestPrice <= self.max*100;
	}
	self.shrunk = function(filter) {
		return self.min >= filter.min && self.max <= filter.max;
	}		
}

function DepartureOutboundTimeFilter(min,max) {
	var self = this;
	self.name = "departureOutboundTimeFilter";
	self.min = min;
	self.max = max;
	self.callback = function(item) {
			return getTotalMinutes(item.legs[0].departureTime) >= self.min && getTotalMinutes(item.legs[0].departureTime) <= self.max;
	}
	self.shrunk = function(filter) {
		return self.min >= filter.min && self.max <= filter.max;
	}		
}

function DepartureInboundTimeFilter(min,max) {
	var self = this;
	self.name = "departureInboundTimeFilter";
	self.min = min;
	self.max = max;
	self.callback = function(item) {
			return getTotalMinutes(item.legs[1].departureTime) >= self.min && getTotalMinutes(item.legs[1].departureTime) <= self.max;
	}
	self.shrunk = function(filter) {
		return self.min >= filter.min && self.max <= filter.max;
	}		
}

function StopAmountFilter(value,status) {
	var self = this;
	self.name = value+"stopAmountFilter";
	self.value = value;
	self.status = status;
	self.callback = function(item) {
		if(status){
			switch(self.value) {
				case 0:
					return !(item.legs[0].stops == self.value && item.legs[1].stops == self.value);
				case 1:
					if(item.legs[0].stops == 0 || item.legs[1].stops == 0)
						return (item.legs[0].stops+item.legs[1].stops) != self.value;
					else
						return !(item.legs[0].stops == self.value && item.legs[1].stops == self.value); 
				case 2:
					if(!(item.legs[0].stops == 1 && item.legs[1].stops == 1))
						return (item.legs[0].stops+item.legs[1].stops) < self.value;
					else
						return true;
			}
		} else
			return true;
	}
	self.shrunk = function(filter) { // not shrunk, more like changed state and needs recalculation
		return self.status == filter.status;
	}		
}

function DepartureFilter(value,status) {
	var self = this;
	self.name = value+"DepartureFilter";
	self.value = value;
	self.status = status;
	self.callback = function(item) {
		if(status){
			return item.legs[0].origin.code != self.value && item.legs[1].destination.code != self.value; 
		} else
			return true;
	}
	self.shrunk = function(filter) { // not shrunk, more like changed state and needs recalculation
		return self.status == filter.status;
	}		
}

function DestinationFilter(value,status) {
	var self = this;
	self.name = value+"DestinationFilter";
	self.value = value;
	self.status = status;
	self.callback = function(item) {
		if(status){
			return item.legs[0].destination.code != self.value && item.legs[1].origin.code != self.value; 
		} else
			return true;
	}
	self.shrunk = function(filter) { // not shrunk, more like changed state and needs recalculation
		return self.status == filter.status;
	}		
}

function AirlineFilter(value, status) {
	var self = this;
	self.name = value + "AirlineFilter";
	self.value = value;
	self.status = status;
	
	self.callback = function(item) {
		if(status){
			flagRetType = true;
			
			jQuery.each(item.airlines, function(index, airline) {
				if(airline.name == self.value) {
					flagRetType = false;
					return false;
				}
			});
			
			return flagRetType;
		} else
			return true;
	}
	
	self.shrunk = function(filter) { // not shrunk, more like changed state and needs recalculation
		return self.status == filter.status;
	}		
}

/***************************
 * 
 * Knockout View Model
 * 
 ***************************/

function RealtimeResultsModelView(flightSearchId, numOfSuppliers) {
	var self = this;
	
	self.supplierLogoMap = new Object();
	self.departureAirportMap = new Object();
	self.destinationAirportMap = new Object();
	self.airlineMap = new Object();
	self.flightSearchId = flightSearchId;	
	self.flightDeals = ko.observableArray();
		
	// airport filter
	self.departureAirports = ko.observableArray();
	self.destinationAirports = ko.observableArray();
	
	// airline filter
	self.airlines = ko.observableArray();
	
	self.totalNumOfResults = ko.computed(function() {
		return self.flightDeals().length;
	});
	
	self.showingFlexibleDates = ko.observable(false);
	
	//*************
    //FILTER LOGIC
    //*************
	self.filterChain = new FilterChain();
	self.areFiltersApplied = ko.observable(false);
	self.filteredFlightDeals = ko.observableArray();
	self.displayFlightDeals = ko.computed({
		read: function() {
			return self.areFiltersApplied() ? self.filteredFlightDeals() : self.flightDeals();
		},
		write: function(filter) {
			if(!self.filterChain.needsRestartFilters(filter))
				self.applyFilter(filter.callback);
			else
				self.applyFilterChain();
			self.areFiltersApplied(true);
		}
	});
		
	self.applyFilter = function(filterCallback) {
		var arrayToFilter = self.areFiltersApplied() ? self.filteredFlightDeals() : self.flightDeals();
		var filteredResults = ko.utils.arrayFilter(arrayToFilter, filterCallback);
        self.filteredFlightDeals.removeAll();
        // back to first page
        self.currentPage = ko.observable(1);
        ko.utils.arrayPushAll(self.filteredFlightDeals,filteredResults);
	}
	
	self.applyFilterChain = function() {
		var filteredResults;
		var arrayToFilter = self.flightDeals();
		var filterCallbacks = self.filterChain.getFilterCallbacks();
		self.filteredFlightDeals.removeAll();
		for(var i=0; i< filterCallbacks.length; i++) {
			filteredResults = ko.utils.arrayFilter(arrayToFilter, filterCallbacks[i]);
			arrayToFilter = filteredResults;
		}
		// back to first page
        self.currentPage = ko.observable(1);
		ko.utils.arrayPushAll(self.filteredFlightDeals,filteredResults);
	}
	
	//*************
    //PAGINATION LOGIC
    //*************
	self.currentNumOfResults = ko.computed(function() {
		if(self.areFiltersApplied())
			return self.filteredFlightDeals().length;
		else
			return self.flightDeals().length;
	});
	
	self.totalNumberOfPages = ko.computed(function(){
		return Math.ceil(self.currentNumOfResults()/10);
	});
	
	self.currentPage = ko.observable(1);
	
	
	self.pagedFlightDeals = ko.computed(function() {
		return self.displayFlightDeals().slice(0, 10 + (self.currentPage()-1)*10);
	});
	
	self.showMoreResults = function() {		
		var possibleNextPage = self.currentPage()+1;
		
		if(possibleNextPage <= self.totalNumberOfPages())
			self.currentPage(possibleNextPage);
	};
	
	self.canShowMoreResults = function(){
		jQuery(".airportCode[title]").tooltip();
		return self.totalNumberOfPages() > self.currentPage() ? true : false;
	};
	
	//*************
    //PROGRESS BAR LOGIC
    //*************
	
	self.numOfSuppliers = ko.observable(numOfSuppliers);
	self.completeSuppliers = ko.observable(0);
	
	self.percentageComplete = ko.computed(function() {
		var percentage = Math.floor((self.completeSuppliers() * 100) / self.numOfSuppliers());
		jQuery("#progressBar").progressbar({value: percentage});
		jQuery("#progressBarSmooth").progressbar({value: percentage});
        return percentage
    }, this);
	
	
		
	self.addDeals = function(data) { 
		jQuery.each(data.data, function(index, deal) {
			var foundId;
			if(self.flightDeals().length > 0) {
				jQuery.each(self.flightDeals(), function(index2, flightDeal) {
					foundId = false;
					if(deal!=undefined && flightDeal!=undefined){
						if(flightDeal.compoundTripId == deal.compoundTripId) {				
							foundId = true;
							// add supplier information and price (this function
							// sorts the prices inside the object and sets
							// cheapest price)
							flightDeal.addFlightResult(deal);							
							return false;
						}
					} else{
						// this should only happen if some stupid error occurred
						alert("impossible exception!");
						return false;
					}
				});
			}
			if(!foundId){
				// create an object from scratch
				flightDeal = new FlightDeal();
				flightDeal.compoundTripId = deal.compoundTripId;
				flightDeal.legs = deal.legs;
				flightDeal.airlines = deal.airlines;
				flightDeal.deeplink = deal.deeplink;
				// adds the new provider to this flightDeal and updates big
				// price
				flightDeal.addFlightResult(deal);				
				self.flightDeals.push(flightDeal);
				// this should attach the event
				// DELEGATE IS VERY IMPORTANT HERE - as these objects are
				// dynamically added to the DOM
				jQuery("#sortedListContainer").delegate("#" + flightDeal.compoundTripId + " .btn-slide", "click", flightDeal.compoundTripId ,function(compoundTripId){
		 			jQuery("#"+compoundTripId.data+" .entryBottom").slideToggle("slow");
		 			jQuery(this).toggleClass("active"); return false;
		 		});
		
				// Add airport so that we can filter them
				self.addAirport(flightDeal.legs[0].origin.code, self.departureAirportMap, self.departureAirports);
				self.addAirport(flightDeal.legs[1].destination.code, self.departureAirportMap, self.departureAirports);
				
				self.addAirport(flightDeal.legs[1].origin.code, self.destinationAirportMap, self.destinationAirports);
				self.addAirport(flightDeal.legs[0].destination.code, self.destinationAirportMap, self.destinationAirports);

				
				
				// Add airlines so that we can filter them
				jQuery.each(flightDeal.airlines, function(index3, airline) {					
					self.addAirline(airline.name, self.airlineMap, self.airlines);					
				});
				
			}
		});
		
		// sort results
		self.flightDeals.sort(function(a, b) {
			return a.cheapestResult().price.amount == b.cheapestResult().price.amount ? 0 :
				(a.cheapestResult().price.amount < b.cheapestResult().price.amount ? -1 : 1);
		});
				
		// increase progress bar
		self.completeSuppliers(self.completeSuppliers()+1);
	};
	
	
	/**
	 * Adds the airport to the airport array so that we can display it in the 
	 * filter section of the page. It also adds the filter to the displayResults array.
	 */
	self.addAirport = function(airportCode, airportMap, airportArray) {
		if(airportMap[airportCode] == undefined) {
			airportMap[airportCode]=airportCode;
			airportArray.push(airportCode);
		}
	}
	
	/**
	 * Adds the airport to the airport array so that we can display it in the 
	 * filter section of the page. It also adds the filter to the displayResults array.
	 */
	self.addAirline = function(airlineName, airlineMap, airlineArray) {
		if(airlineMap[airlineName] == undefined) {
			airlineMap[airlineName] = airlineName;
			airlineArray.push(airlineName);
		}
	}
	
	self.getDate = function(dateInMillis) {
		if ( dateInMillis < 0 )
			return "";
		else
			return new moment(dateInMillis).format("ddd DD MMM YYYY");
	};
	
	self.getTime = function(dateInMillis) {
		if ( dateInMillis < 0 )
			return "";
		else
			return new moment(dateInMillis).format("HH:mm");
	};
	
	self.getFormattedPrice = function(amount) {
		if(amount < 0)
			return "n/a";
		else
			return Math.round(amount/100);
	}
	
	self.getDayDifference = function(leg) {
		arrivalTime = moment(leg.arrivalTime);
		departureTime = moment(leg.departureTime);
		
		return arrivalTime.diff(departureTime, 'days');
	}
	
	self.getLogo = function(supplierId) {
		
		return self.supplierLogoMap[""+supplierId];
	}
	
	self.mainBookClick = function(deal, trackingSource) {
		var parameters = {
			's':self.flightSearchId,
			'supplier':deal.cheapestResult().provider.supplier.id,
			'deeplink':deal.cheapestResult().deepLink,
			'type': trackingSource + "frt"
		};
		var url = "/track-flight-deal.html";
		var target = "results_" + self.flightSearchId + "_" + self.flightDeals().indexOf(deal);
		
		postToNewWindow(url, parameters, target);
		
		self.markDealAsViewed(deal);
		
		return false;
	};
	
	self.extraBookClick = function(parentDeal, deal, trackingSource) {
		var parameters = {
			's':self.flightSearchId,
			'supplier':deal.provider.supplier.id,
			'deeplink':deal.deepLink,
			'type': trackingSource + "frt"
		};
		var url = "/track-flight-deal.html";
		var target = "results_" + self.flightSearchId + "_" + self.flightDeals().indexOf(parentDeal) + "_" + parentDeal.flightResults().indexOf(deal);
		
		postToNewWindow(url, parameters, target);
		// self.markDealAsViewed(deal); // should not mark big deal as viewed
		
		return false;
	};
	
	self.partnerClick = function(searchId, supplierId, trackingSource) {
		var parameters = {
			's':searchId,
			'supplier':supplierId,
			'deeplink':'',
			'type': trackingSource + "sfrt"
		};
		var url = "/track-flight-deal.html";
		var target = "results_" + supplierId;
		
		postToNewWindow(url, parameters, target);
		
		return false;
	};
	
	self.markDealAsViewed = function(deal) {
		if(!deal.wasViewed())
			deal.wasViewed(true);
	}
	
	self.searchComplete = function() {
		return self.completeSuppliers() == self.numOfSuppliers() ? true : false;
	}
	
	self.noResults = function() {
		return (!self.flightDeals().length > 0 && self.searchComplete()) || (self.areFiltersApplied() && !self.displayFlightDeals().length > 0);
	}
	
	self.currentResults = ko.computed(function() {
		return self.areFiltersApplied() ? self.filteredFlightDeals().length : self.flightDeals().length;
	});
	
	self.datesNotEqual = function(date1, date2) {
		
		if ( date1 != date2 ){
			return true;
		} else {
			return false;
		}
	}
}

/***************************
 * 
 * Time Slider Helpers
 * 
 ***************************/

function getTimeString(totalMinutes) {
	minutes = totalMinutes % 60;
	hours = (totalMinutes-minutes)/60;
	return minutes >= 10 ? hours+":"+minutes : hours+":0"+minutes;
}

function getTotalMinutes(milliseconds) {
	hours = moment(milliseconds).hours();
	minutes = moment(milliseconds).minutes();
	return hours*60+minutes;
}

/***************************
 * 
 * Email results dialog box
 * 
 ***************************/
function emailResults(searchId) {
	jQuery(".emailSearchForm").dialog({
		height: 400,
		width: 350,
		modal: true,
		resizable: false,
		title: "Email your results",
		buttons: {
			"Send": function() {
				var searchId = jQuery(".emailSearchForm input#e-searchId").val();
				var userReference = jQuery(".emailSearchForm input#e-userReference").val();
				var userEmail = jQuery(".emailSearchForm input#user-email").val();
				var subscribeCheckbox = jQuery(".emailSearchForm input#subscribe-check").is(':checked');
				var toEmail = jQuery(".emailSearchForm input#to-email").val();
				
				// check if user email is invalid
				if(!isEmail(userEmail)) {
					jQuery(".emailSearchForm .errors").empty();
					jQuery(".emailSearchForm .errors").append('<p style="color:red">The email you entered is not valid!</p>');
					return false;
				}
				
				// TODO: to-email validation
				
				var dataString = "searchId="+searchId
								+"&user.reference="+userReference
								+"&user.email="+userEmail
								+"&subscribe="+subscribeCheckbox 
								+"&to-email="+toEmail;
				
				jQuery.ajax({  
					type: "POST",  
					url: "/email-search-results.html",  
					data: dataString,  
					success: function() {
						jQuery(".emailSearchForm .errors").empty();
						jQuery( ".emailSearchForm" ).dialog('close');  
					}
				});  
			}
		},
		close: function(event, ui) { 
			jQuery(".emailSearchForm .errors").empty();
			jQuery(".emailSearchForm input#user-email").val('');
		}
	});
}

// Check if given email is valid
function isEmail(email) {
	  var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	  return regex.test(email);
}

/********************************
 * 								*
 * ON DOCUMENT READY (THE MAIN)	*
 * 								*
 ********************************/

jQuery(document).ready(function() {
	
	//*************
	// email results events
	//*************
    jQuery("#.emailSearchForm input#user-email").focus( function() {
        if ( jQuery(this).val()=="Enter your email address") {
        	jQuery(this).val('');
        } 
    });

    jQuery("#.emailSearchForm input#user-email").blur( function() {
        if ( jQuery(this).val()=="") {
        	jQuery(this).val('Enter your email address');
        } 
    });
	
    
	//*************
    //price slider
    //*************
	jQuery("#priceSlider").slider({
		range: true,
		min: 0,
		max: 7000,
		step: 10,
		values: [0, 7000],
		slide: function( event, ui ) {
			jQuery("#priceRange").text("£"+ui.values[0]+" - £"+ui.values[1]);
		}
	});
	jQuery("#priceRange").text("£"+jQuery("#priceSlider").slider("values", 0) +
			" - £" + jQuery("#priceSlider").slider("values", 1));
	
	jQuery("#priceSlider").bind("slidestop", function(event,ui) {
		// adds a new filter to displayFlightDeals
		realtimeResultsViewModel.displayFlightDeals(new PriceFilter(jQuery("#priceSlider").slider("values",0),jQuery("#priceSlider").slider("values",1)));
	});
	
	//*************
	//outbound dep time slider
	//*************
	jQuery("#outboundTimeSlider").slider({
		range: true,
		min: 0,
		max: 1439,
		step: 1,
		values: [0, 1439],
		slide: function( event, ui ) {
			jQuery("#outboundTimeRange").text(getTimeString(ui.values[0])+" - "+getTimeString(ui.values[1]));
		}
	});
	
	jQuery("#outboundTimeRange").text(getTimeString(jQuery("#outboundTimeSlider").slider("values", 0)) +
			" - " + getTimeString(jQuery("#outboundTimeSlider").slider("values", 1)));
	
	jQuery("#outboundTimeSlider").bind("slidestop", function(event,ui) {
		// adds a new filter to displayFlightDeals
		realtimeResultsViewModel.displayFlightDeals(new DepartureOutboundTimeFilter(jQuery("#outboundTimeSlider").slider("values",0),jQuery("#outboundTimeSlider").slider("values",1)));
	});
	
	//*************
	//inbound dep time slider
	//*************
	jQuery("#inboundTimeSlider").slider({
		range: true,
		min: 0,
		max: 1439,
		step: 1,
		values: [0, 1439],
		slide: function( event, ui ) {
			jQuery("#inboundTimeRange").text(getTimeString(ui.values[0])+" - "+getTimeString(ui.values[1]));
		}
	});
	
	jQuery("#inboundTimeRange").text(getTimeString(jQuery("#inboundTimeSlider").slider("values", 0)) +
			" - " + getTimeString(jQuery("#inboundTimeSlider").slider("values", 1)));
	
	jQuery("#inboundTimeSlider").bind("slidestop", function(event,ui) {
		// adds a new filter to displayFlightDeals
		realtimeResultsViewModel.displayFlightDeals(new DepartureInboundTimeFilter(jQuery("#inboundTimeSlider").slider("values",0),jQuery("#inboundTimeSlider").slider("values",1)));
	});
	
	//*************
	// progress bar animation
	//*************
	jQuery("#progressBar").bind("progressbarcomplete", function(event,ui) {
		jQuery(".loading-box").hide(1000);
		
	});
	
	jQuery("#progressBarSmooth").bind("progressbarcomplete", function(event,ui) {
		jQuery(".progressBarSmooth").hide(1000);
	});
	
	setTimeout(function(){
		if(!realtimeResultsViewModel.searchComplete()) {
			jQuery(".loading-box").hide(1000);
			jQuery(".progressBarSmooth").show(1000);
		}		
	},20000);
});
