describe('core', function () {

  var testList = realist({ 
    quantifier: 'amount'
  });

  it('should return an empty list after creation', function () {
    expect(testList.getItems().length).toBe(0);    
  });
});
