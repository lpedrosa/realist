var realtimeResultsViewModel = (function() {
  var deals = [];//ko.observableArray();

  var totalOffers = 0;

  return {
    // This method adds the received deals to the model's array. It
    // conveniently groups offers with the same compound_id together
    // FIXME This method works ok for flights but it should be pluggable.
    addDeals: function(dealsIn) {
      var dealsIndexCache = {};

      for(var i = 0, dealsSize = dealsIn.length; i < dealsSize; i += 1) {
        // try and fetch index from cache
        var cacheIndex = dealsIndexCache[dealsIn[i].compoundTripId] === undefined ? -1 : dealsIndexCache[dealsIn[i].compoundTripId];

        if(deals.length === 0 || cacheIndex === -1) {
          var deal = new Deal();
          deal.addTravelOffer(dealsIn[i]);

          // add deal to array
          deals.push(deal);
          // add new deal index to cache
          dealsIndexCache[dealsIn[i].compoundTripId] = i;
        } else {
          deals[cacheIndex].addTravelOffer(dealsIn[i]);
        }

        totalOffers += 1;
      }

      // TODO sort the array
    },

    getTotalOffers: function() {
      return totalOffers;
    },

    getDeals: function() {
      return deals;
    }
  };
})();
