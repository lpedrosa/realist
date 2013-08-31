/* global describe:false, it:false, beforeEach:false, expect:false, realist:false */
describe('core', function () {

  "use strict";

  var map = function(arr, fn) {
    var mappedArr = [];
    for(var i = 0, arrSize = arr.length; i < arrSize; i += 1) {
      mappedArr.push(fn(arr[i]));
    }
    return mappedArr;
  };

  var items = [
    { amount: 10 },
    { amount: 5 },
    { amount: 25 }
  ];

  var testList = realist({ 
    quantifier: function(item) { return item.amount; }
  });

  beforeEach(function() {
    testList.clearItems();
  });

  //
  // Tests
  //

  it('should return an empty list after creation', function () {
    expect(testList.getItems().length).toBe(0);    
  });

  it('should sort the added items by the given quantifier', function() {
    testList.addItems(items);

    var amountsSorted = map(testList.getItems(), function(item) { return item.amount || 0; });
    
    expect(amountsSorted).toEqual([5,10,25]);
  });
});
