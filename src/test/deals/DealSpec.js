describe('Deal', function() {

  var testDeal;
  var offers = [
  { price: { amount: '100' } },
  { price: { amount: '50' } }];

  beforeEach(function() {
    testDeal = new Deal();
  });

  it('has no offers if was just created', function() {
    expect(testDeal.offers.length).toEqual(0);
  });

  it("has a cheapestPrice equal to it's only offer", function() {
    var offer = offers[0];
    var offerPrice = parseInt(offer.price.amount, 10);

    testDeal.addTravelOffer(offer);

    var cheapestPrice = parseInt(testDeal.cheapestOffer.price.amount, 10);
    
    expect(cheapestPrice).toEqual(offerPrice);
  });

  it("has a cheapestPrice that it's always the cheapest of it's offers", function() {
    var cheapestOfferPrice = parseInt(offers[1].price.amount, 10);

    for(var i = 0, offersLength = offers.length; i < offersLength; i += 1) {
      testDeal.addTravelOffer(offers[i]);
    }

    var cheapest = parseInt(testDeal.cheapestOffer.price.amount, 10);

    expect(cheapest).toEqual(cheapestOfferPrice);
  });
  
});
