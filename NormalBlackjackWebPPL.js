// represent player hand - [0]: value, [1]: ace in hand, (can be treated as 1 if needed)
var hand = [0, false]

  // generate a random card, assuming each rank occurs w.p. 1/13
  // in particular, this means the values 1 through 9 appear w.p. 1/13
  // the value 10 appears w.p. 4/13, as 10, J, Q, K all count as 10
  var getCard = function() {
    var card = randomInteger(13) + 1;
    return (card < 10) ? card : 10;
  }

  var handUpdate = function(hand, player, dealerCard) {
    if (hand[0] > 21) {
      return 22;
    }
    if (player(hand, dealerCard)) {
      var card = getCard();
      if (card == 1 && hand[0] <= 10){
        var newHand = [hand[0] + 11, true];
        return handUpdate(newHand, player, dealerCard);
      }else if(hand[0] + card > 21 && hand[1]){
        var newHand = [hand[0] + card - 10, false];
        return handUpdate(newHand, player, dealerCard);
      }else{
        var newHand = [hand[0] + card, hand[1]];
        return handUpdate(newHand, player, dealerCard);
      }
    }else{
      return hand[0];
    }
  }

  var doPlayerHand = function(player, dealerCard) {
    var c1 = getCard();
    var c2 = getCard();
    var val = c1 + c2;
    if (c1 == 1 || c2 == 1){
      return handUpdate([val+ 10, true], player, dealerCard);
    }else{
      return handUpdate([val, false], player, dealerCard);
    }
  }

  // dealer's strategy, which is to hit on 16 or less and stand of 17 or higher
  var dealer = function(hand, unused) {
    return (hand[0] < 17);
  }

  var doDealerHand = function(dealerCard) {
    var hiddenCard = getCard();
    var val = dealerCard + hiddenCard;
    if (dealerCard == 1 || hiddenCard == 1){
      return handUpdate([val + 10, true], dealer, dealerCard);
    }else{
      return handUpdate([val, false], dealer, dealerCard);
    }
  }

  // final hand value distribution for dealer
  var Dealer = Enumerate(function() {doDealerHand(getCard())});
  print(Dealer);
  viz(Dealer);


  var doBothHands = function(player) {
    var dealerCard = getCard();
  //   note: we don't do the following two lines, it's much faster to enumerate
  //         first and then sample
  //   var playerHand = doPlayerHand(player, dealerCard);
  //   var dealerHand = doDealerHand(dealerCard);
    var playerHand = sample(Enumerate(function() {doPlayerHand(player, dealerCard)}));
    var dealerHand = sample(Enumerate(function() {doDealerHand(dealerCard)}));
    if (playerHand > 21) {
      return -1;
    }
    if (dealerHand > 21) {
      return 1;
    }
    if (dealerHand > playerHand) {
      return -1;
    }
    if (playerHand > dealerHand) {
      return 1;
    }
    return 0;
  }

  // win/loss/tie statistics for when the player also uses the dealer strategy
  var Both = Enumerate(function() {doBothHands(dealer)});
  print(Both);
  viz(Both);