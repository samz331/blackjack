  // generate a random card, assuming each rank occurs w.p. 1/13
  // in particular, this means the values 1 through 9 appear w.p. 1/13
  // the value 10 appears w.p. 4/13, as 10, J, Q, K all count as 10
  var getCard = function() {
    var card = randomInteger(13) + 1;
    return (card < 10) ? card : 10;
  }
  
  
  var handUpdate = function(val, player, dealerCard) {
    if (val > 21) {
      return val;
    }
    return player(val, dealerCard) ? handUpdate(val + getCard(), player, dealerCard) : val;
  }
  
  var doPlayerHand = function(player, dealerCard) {
    var c1 = getCard();
    var c2 = getCard();
    var val = c1 + c2;
    return handUpdate(val, player, dealerCard);
  }
  
  // dealer's strategy, which is to hit on 16 or less and stand of 17 or higher
  var dealer = function(val, unused) {
    return (val < 17);
  }
  
  var doDealerHand = function(dealerCard) {
    var hiddenCard = getCard();
    var val = dealerCard + hiddenCard;
    return handUpdate(val, dealer, dealerCard);
  }
  
  // optimal player's strategy, which depends on the dealer's visible card
  var optimalPlayer = function(val, dealerCard) {
    if (dealerCard == 1) {
      return val < 14;
    } else if (dealerCard == 2 || dealerCard == 3) {
      return val < 13;
    } else if (dealerCard == 4 || dealerCard == 5 || dealerCard == 6) {
      return val < 12;
    } else if (dealerCard == 7 || dealerCard == 8 || dealerCard == 9) {
      return val < 17;
    } else {
      return val < 16;
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
  
  // win/loss/tie statistics for when the player uses the optimal strategy
  var OptimalBoth = Enumerate(function() {doBothHands(optimalPlayer)});
  print(OptimalBoth);
  viz(OptimalBoth);