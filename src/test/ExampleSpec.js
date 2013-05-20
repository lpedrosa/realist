describe("Example", function() {
  var example;

  beforeEach(function() {
    example = { a: 2 }
  });

  it("should be equal to 2", function() {
    expect(example.a).toBe(2);
  })

});
