  // helper function for topological sort
  function visitNode(state, transitions, visited, result) {
    if (state in visited && visited[state] == true) {
      throw new Error(`Not a DAG(Cycle detected) ${state}`);
    } else if (state in visited) {
      return;
    }
  
    visited[state] = true;
  
    if (state in transitions) {
      // not a terminal state
      for (const action in transitions[state]) {
        for (const nextState in transitions[state][action]) {
          visitNode(nextState, transitions, visited, result);
        }
      }
    }
  
    visited[state] = false;
    result.unshift(state);
  }
  
  // DFS-based implementation of topological sort
  function topologicalSort(states, transitions) {
    // topologically sorted list
    var result = [];
  
    // record which states have been visited
    // mapped to true - active, false - done
    var visited = {};
  
    for(const state_idx in states) {
      visitNode(states[state_idx], transitions, visited, result);
    }
  
    return result;
  }

  // helper function for determining value of best action
  function getValue(obj){
    return Math.max(...Object.values(obj));
  }

  // generates the state-action value function Q for a given MDP
  function getQ(states, transitions, rewards) {
    var sortedStates = topologicalSort(states, transitions);
    Q = {}
    while (sortedStates.length != 0){
      var state = sortedStates.pop();
      if (!(state in transitions)) {
        // denotes final state
        Q[state] = {"dummy" : 0};
        continue;
      }
      Q[state] = {}
      for (action in transitions[state]) {
        nextStateProbs = transitions[state][action];
        value = 0;
        for (nextState in nextStateProbs) {
          stateVal = getValue(Q[nextState]);
          value += nextStateProbs[nextState] * (stateVal + rewards[state][action][nextState]);
        }
        Q[state][action] = value;
      }
    }
    return Q;
  }