// note: will need to import functions from SolveAcyclicMDP here


// given state values, determine all possible transitions and their
// probabilities assuming the active player hits
function getNewCard(playerVal, playerSoft, dealerVal, dealerSoft, dealerMove) {
  var result = {};

  for (var i = 1; i < 11; i++){
    if (dealerMove) {
      if (i == 1 && dealerVal <= 10) {
        var newVal = dealerVal + 11;
        var packedState = packState(playerVal, playerSoft, newVal, true, true);
      } else if (dealerVal + i > 21 && dealerSoft) {
        var newVal = dealerVal + i - 10;
        var packedState = packState(playerVal, playerSoft, newVal, false, true);
      } else {
        var newVal = Math.min(dealerVal + i, 22);
        var packedState = packState(playerVal, playerSoft, newVal, dealerSoft, true);
      }
    } else{
      if (i == 1 && playerVal <= 10) {
        var newVal = playerVal + 11;
        var packedState = packState(newVal, true, dealerVal, dealerSoft, false);
      } else if (playerVal + i > 21 && playerSoft) {
        var newVal = playerVal + i - 10;
        var packedState = packState(newVal, false, dealerVal, dealerSoft, false);
      } else {
        var newVal = Math.min(playerVal + i, 22);
        var packedState = packState(newVal, playerSoft, dealerVal, dealerSoft, false);
      }
    }

    var probIncrease = (i < 10) ? 1/13 : 4/13;
    if (packedState in result) {
      result[packedState] += probIncrease;
    } else {
      result[packedState] = probIncrease;
    }
  }
  return result;
}

// convert state values to string representation
function packState(playerVal, playerSoft, dealerVal, dealerSoft, dealerMove) {
  return "("+ playerVal.toString() + "," + playerSoft.toString() + "," + dealerVal.toString() + "," + dealerSoft.toString() + "," + dealerMove.toString() + ")";
}

// extract state values from string representation
function parseState(s) {
  var snew = s.split(',');
  var player = parseInt(snew[0].slice(1));
  var playerSoft = snew[1] === "true";
  var dealer = parseInt(snew[2]);
  var dealerSoft = snew[3] === "true";
  var dealerMove = (snew[4].slice(0, -1) === "true");
  return [player, playerSoft, dealer, dealerSoft, dealerMove];
}


// Given a state, returns object mapping each action (hit/stand)
// to the corresponding transitions and their probabilities
// pre: s != final
function genTransitions(s) {
  const [playerVal, playerSoft, dealerVal, dealerSoft, dealerMove] = parseState(s);

  if (dealerMove) {
    if (dealerVal >= 17) {
      return {"stand": {"final": 1}, "hit": {"final" : 1}};
    } else {
      var nextStateProbs = getNewCard(playerVal, playerSoft, dealerVal, dealerSoft, true);
      return {"stand": nextStateProbs,
              "hit": nextStateProbs}
    }
  } else {
    var result = {};
    var standState = packState(playerVal, false, dealerVal, dealerSoft, true);
    result["stand"] = {[standState]: 1};

    if (playerVal >= 22) {
      result["hit"] = {[standState] : 1};
    } else {
      result["hit"] = getNewCard(playerVal, playerSoft, dealerVal, dealerSoft, false);
    }

    return result;
  }

}

// Gets the reward for transitioning out of a state
// note this is 0 unless the state transitions to the final state
function getReward(playerVal, dealerVal, dealerMove) {
  // check if in final state
  if (dealerMove && dealerVal >= 17) {
    if (playerVal >= 22) {
      return -1;
    }
    if (dealerVal >= 22) {
      return 1;
    }

    if (playerVal > dealerVal) {
      return 1;
    } else if (playerVal == dealerVal) {
      return 0;
    } else {
      return -1;
    }
  } else {
    return 0;
  }
}

// Given the transitions, generate the rewards mapping
function getRewards(transitions) {
  var result = {};
  for (var state in transitions) {
    result[state] = {};
    var trans = transitions[state];
    const [playerVal, playerSoft, dealerVal, dealerSoft, dealerMove] = parseState(state);
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

// generate all states with no predecessor
// entire chain can be constructed from just these states
var initialStates = [];
for (var i = 2; i <= 11; i++) {
  initialStates.push(packState(4, false, i, (i == 11), false));
  initialStates.push(packState(5, false, i, (i == 11), false));
  initialStates.push(packState(12, true, i, (i == 11), false));
}

// generate the transitions for the MDP
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
delete transitions["final"]; // no transition out of final state

// generate the reward mapping for the MDP
var rewards = getRewards(transitions);

states = Object.keys(transitions);
states.push("final");

// note at this point that the variables (states, transitions, rewards)
// define the relevant MDP dynamics



// the remaining code can be used to test what's implemented above
// and produce interesting results from it
// for some tests you will need to import functions from SolveAcyclicMDP

/*
// examine transitions and rewards to get a sense of their representation
console.log(Object.keys(transitions).length);
console.log(transitions[packState(2, false, 2, false, false)]);
console.log(rewards);
console.log(rewards[packState(4, false, 21, true, true)]);
console.log(rewards[packState(4, false, 21, false, true)]);
console.log(rewards[packState(21, false, 22, false, true)]);
console.log(rewards[packState(22, false, 22, false, true)]);
console.log(rewards[packState(17, false, 17, true, true)]);
console.log(rewards[packState(17, false, 17, false, true)]);

// test functions from SolveAcyclicMDP
var sortedStates = topologicalSort(states, transitions);
console.log(sortedStates[sortedStates.length - 1]);
var Q = getQ(states, transitions, rewards);
console.log(Q);

// given a Q function and a state, returns the optimal action from that state
function optimalPlayerStrategy(Q, state) {
  var obj = Q[state];
  return Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b });
}

// test the function above
var state = packState(20, true, 7, false, false);
var action = optimalPlayerStrategy(Q, state);
console.log(action, Q[state]);

// determine the optimal action and value for all starting states
for (var dealerVal = 2; dealerVal <= 11; dealerVal++) {
  for (var playerVal = 4; playerVal <= 20; playerVal++) {
    var state = packState(playerVal, false, dealerVal, (dealerVal == 11), false);
    var action = optimalPlayerStrategy(Q, state);
    console.log(playerVal, false, dealerVal, (dealerVal == 11), action, Q[state]);
  }
  for (var playerVal = 12; playerVal <= 21; playerVal++) {
    var state = packState(playerVal, true, dealerVal, (dealerVal == 11), false);
    var action = optimalPlayerStrategy(Q, state);
    console.log(playerVal, true, dealerVal, (dealerVal == 11), action, Q[state]);
  }
}
*/