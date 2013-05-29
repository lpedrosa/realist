var Deal = function(properties) {
  var properties = properties | {};
  
  // initialize inner vars
  this.offers = [];
};

Deal.prototype.addTravelOffer = function(offer) {
  var offer =  offer || {};
  var offerPrice =  offer.price && offer.price.amount;
  var cheapestPrice = this.cheapestOffer && this.cheapestOffer.price && this.cheapestOffer.price.amount;
  
  if(offerPrice !== undefined) {
    // set new cheapest
    if(cheapestPrice === undefined || parseInt(cheapestPrice, 10) > parseInt(offerPrice, 10)) {
      this.cheapestOffer = offer;
    } 
    // store offer
    this.offers.push(offer);
  }
};

Deal.prototype.displayCheapestPrice = function() {
  return this.cheapestOffer && this.cheapestOffer.price && this.cheapestOffer.amount || 'No Price';
};
