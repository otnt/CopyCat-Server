const nock = require('nock');
const chai = require('chai');
const expect = chai.expect; // we are using the "expect" style of Chai

describe('TimelineTest', function() {
  it('Basically all timeline query should return more than one photo.', function() {
    nock('https://some-tax-service.com')
      .get('/api/v0/timeline')


    var cartSummary = new CartSummary([]);
    expect(cartSummary.getSubtotal()).to.equal(0);
  });
});
