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

  it('has to contain a total number of offers corresponding to the test set', function() {
    realtimeResultsViewModel.addDeals(offers);

    expect(realtimeResultsViewModel.getTotalOffers()).equals(offers.length);
  });

  it('sorts the offers after it adds them to the view model', function () {
    fail();
  });
});
