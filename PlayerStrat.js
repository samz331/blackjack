
// false -- indicates player's turn
var states = [];
console.log(states);



function getNewCard(playerVal, dealerVal, dealerMove) {
  var result = {};

  for (var i = 1; i < 11; i++){
    if (dealerMove) {
      var newVal = Math.min(dealerVal + i, 22);
      var packedState = packState(playerVal, newVal, true);
    }else{
      var newVal = Math.min(playerVal + i, 22);
      var packedState = packState(newVal, dealerVal, false);
    }

    var probIncrease = (i < 10) ? 1/13 : 4/13;
    if (packedState in result){
      result[packedState] += probIncrease;
    }else{
      result[packedState] = probIncrease;
    }
  }
  return result;
}


function packState(playerVal, dealerVal, dealerMove) {
  return "("+ playerVal.toString() + "," + dealerVal.toString() + "," + dealerMove.toString() + ")";
}


function parseState(s) {
  var snew = s.split(',');
  var player = parseInt(snew[0].slice(1));
  var dealer = parseInt(snew[1]);
  var dealerMove = (snew[2].slice(0, -1) === "true");
  return [player, dealer, dealerMove];
}


// Takes state -> Object[Stand/Hit] -> [Object (state: probabilities)]
// pre: s != final
function genTransitions(s) {
  const [playerVal, dealerVal, dealerMove] = parseState(s);

  if (dealerMove) {
    if (dealerVal >= 17) {
      return {"stand": {"final": 1}, "hit": {"final" : 1}};
    }else{
      var nextState = getNewCard(playerVal, dealerVal, true);
      return {"stand": nextState,
              "hit": nextState}
    }
  }else{
    var result = {};
    var standState = packState(playerVal, dealerVal, true);
    result["stand"] = {[standState]: 1};

    if(playerVal >= 22) {
      result["hit"] = {[standState] : 1};
    }else{
      result["hit"] = getNewCard(playerVal, dealerVal, false);
    }

    return result;
  }

}


function getReward(playerVal, dealerVal, dealerMove) {
  // check if in final state
  if (dealerMove && dealerVal >= 17) {
    if (playerVal >= 22) {
      return -1;
    }
    if(dealerVal >= 22) {
      return 1;
    }

    if(playerVal > dealerVal){
      return 1;
    }else if(playerVal == dealerVal){
      return 0;
    }else{
      return -1;
    }
  }else{
    return 0;
  }
}


function getRewards(transitions) {
  var result = {};
  for (var state in transitions) {
    result[state] = {};
    var trans = transitions[state];
    const [playerVal, dealerVal, dealerMove] = parseState(state);
    var reward = getReward(playerVal, dealerVal, dealerMove);
    result[state]["stand"] = {};
    for (var nextState in trans["stand"]) {
      result[state]["stand"][nextState] = reward;
    }
    result[state]["hit"] = {};
    for (var nextState in trans["hit"]) {
      result[state]["hit"][nextState] = reward;
    }
  }
  return result;
}


// TODO: update initialStates
var initialStates = [];
for (var i = 1; i < 11; i++) {
  initialStates.push(packState(2, i, false));
}
console.log(initialStates);
var queue = [...initialStates];
var transitions = {"final": {}};

while (queue.length != 0){
  var s = queue.pop();
  if (s in transitions) {
    continue;
  }
  var trans = genTransitions(s);
  transitions[s] = trans;
  for (var nextState in trans["stand"]) {
    queue.push(nextState);
  }
  for (var nextState in trans["hit"]) {
    queue.push(nextState);
  }
}

delete transitions["final"];

var rewards = getRewards(transitions);
console.log(Object.keys(transitions).length);
console.log(transitions[packState(2, 2, false)]);
// console.log(rewards);
console.log(rewards[packState(2, 21, true)]);
console.log(rewards[packState(21, 22, true)]);
console.log(rewards[packState(22, 22, true)]);
console.log(rewards[packState(17, 17, true)]);


// for (var i = 2; i <= 22; i++) {
//   for (var j = 1; j <= 22; j++) {
//     states.push([i, j, false]);
//     states.push([i, j, true]);
//   }
// }




