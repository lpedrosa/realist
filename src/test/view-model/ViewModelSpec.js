describe('ViewModel', function() {
  var offers = [
    {
      compoundTripId: '123D',
      price: { amount: '100' }
    },
    {
      compoundTripId: '158G',
      price: { amount: '50' }
    },
    {
      compoundTripId: '234F',
      price: { amount: '20' }
    },
    {
      compoundTripId: '123D',
      price: { amount: '95' }
    }
  ];

  var isSortedAscending = function(array) {
    function checkSorted(array, lastElement) {
      if(array.length === 0) {
        return true;
      } else {
        var poppedElement = array.pop();
        if(lastElement === undefined || parseInt(lastElement.cheapestOffer.price.amount, 10) < parseInt(poppedElement.cheapestOffer.price.amount, 10)) {
          return checkSorted(array, poppedElement);
        } else { 
          return false; 
        }
      }
    }

    return checkSorted(array);
  };

  beforeEach(function() {
    realtimeResultsViewModel.clearDeals();
  });

  it('has to contain a total number of offers corresponding to the test set', function() {
    realtimeResultsViewModel.addDeals(offers);

    expect(realtimeResultsViewModel.getTotalOffers()).toBe(offers.length);
    expect(realtimeResultsViewModel.getDeals().length).toBe(3);
  });

  it('sorts the offers after it adds them to the view model', function() {
    realtimeResultsViewModel.addDeals(offers);
    
    expect(isSortedAscending(realtimeResultsViewModel.getDeals())).toBe(true);
  });
});
