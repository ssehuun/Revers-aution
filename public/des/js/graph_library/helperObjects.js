/*
 * Data structures to assist internal implementation of algorithmic visualizations
 */


// Make sure to check the type of the objects passed in to avoid bugs (especially if used for comparisons)
var ObjectPair = function(objectOne, objectTwo) {
  this.getFirst = function() { return objectOne; }
  this.getSecond = function() { return objectTwo; }
  this.setFirst = function(newObjectOne) { objectOne = newObjectOne; }
  this.setSecond = function(newObjectTwo) { objectTwo = newObjectTwo; }
}

ObjectPair.compare = function(objPairOne, objPairTwo) {
  if (objPairOne.getFirst() > objPairTwo.getFirst()) return 1;
  else if (objPairOne.getFirst() < objPairTwo.getFirst()) return -1;
  else {
    if (objPairOne.getSecond() > objPairTwo.getSecond()) return 1;
    if (objPairOne.getSecond() < objPairTwo.getSecond()) return -1;
    else return 0;
  }
}


// Make sure to check the type of the objects passed in to avoid bugs (especially if used for comparisons)
var ObjectTriple = function(objectOne, objectTwo, objectThree) {
  this.getFirst = function() { return objectOne; }
  this.getSecond = function() { return objectTwo; }
  this.getThird = function() { return objectThree; }
  this.setFirst = function(newObjectOne) { objectOne = newObjectOne; }
  this.setSecond = function(newObjectTwo) { objectTwo = newObjectTwo; }
  this.setThird = function(newObjectThree) { objectThree = newObjectThree; }
}

ObjectTriple.compare = function(objTripleOne, objTripleTwo) {
  if (objTripleOne.getFirst() > objTripleTwo.getFirst()) return 1;
  else if (objTripleOne.getFirst() < objTripleTwo.getFirst()) return -1;
  else {
    if (objTripleOne.getSecond() > objTripleTwo.getSecond()) return 1;
    if (objTripleOne.getSecond() < objTripleTwo.getSecond()) return -1;
    else {
      if (objTripleOne.getThird() > objTripleTwo.getThird()) return 1;
      if (objTripleOne.getThird() < objTripleTwo.getThird()) return -1;
      else return 0;
    }
  }
}


var UfdsHelper = function() {
  /*
   * Structure of internalUfds:
   * - key: inserted key
   * - value: JS object with:
   *          - "parent"
   *          - "rank"
   */
  var self = this;
  var internalUfds = {};

  this.insert = function(insertedKey){
    if (internalUfds[insertedKey] != null) return false;
    var newElement = {};
    newElement["parent"] = insertedKey;
    newElement["rank"] = 0;
    internalUfds[insertedKey] = newElement;
  }

  this.findSet = function(key){
    if (internalUfds[key] == null) return false;

    var currentParent = internalUfds[key]["parent"];
    var currentElement = key;
    while (currentParent != currentElement) {
      currentElement = currentParent;
      currentParent = internalUfds[currentElement]["parent"];
    }
    internalUfds[key]["parent"] = currentParent;

    return currentParent;
  }

  this.unionSet = function(firstKey, secondKey){
    if (internalUfds[firstKey] == null || internalUfds[secondKey] == null) return false;
    if (self.isSameSet(firstKey,secondKey)) return true;

    var firstSet = self.findSet(firstKey);
    var secondSet = self.findSet(secondKey);

    if (internalUfds[firstSet]["rank"] > internalUfds[secondSet]["rank"]){
      internalUfds[firstSet]["parent"] = secondSet;
      internalUfds[secondSet]["rank"]++;
    }
    else {
      internalUfds[secondSet]["parent"] = firstSet;
      internalUfds[firstSet]["rank"]++;
    }
  }

  this.isSameSet = function(firstKey, secondKey){
    if (internalUfds[firstKey] == null || internalUfds[secondKey] == null) return false;
    return self.findSet(firstKey) == self.findSet(secondKey);
  }
}


function IsUndirected(iVL, iEL) {
  if (iVL.length == 0) return true;
  var M = [];
  for (var i in iVL) {
    M[i] = [];
    for (var j in iVL)
      M[i][j] = 0;
  }
  for (var key in iEL) {
    var u = iEL[key]["u"], v = iEL[key]["v"], w = iEL[key]["w"];
    M[u][v] = w;
  }
  for (var i in iVL)
    for (var j in iVL)
      if (M[i][j] != M[j][i])
        return false;
  return true;
}

function IsConstantWeighted(iVL, iEL) {
  if (iVL.length == 0) return true;
  var ref = iEL[0]["w"];
  for (var key in iEL)
    if (iEL[key]["w"] != ref)
      return false;
  return true;
}

function HasNegativeWeight(iVL, iEL) {
  if (iVL.length == 0) return false;
  for (var key in iEL)
    if (parseInt(iEL[key]["w"]) < 0)
      return true;
  return false;
}

function IsTree(iVL, iEL) {
  if (iVL.length == 0) return true;
  if (!IsUndirected(iVL, iEL)) return false;

  function dfs(u) {
    visited[u] = true;
    for (var key in iEL)
      if ((iEL[key]["u"] === u) && (visited[iEL[key]["v"]] === false))
        dfs(iEL[key]["v"]);
  }

  var V = 0, E = 0, visited = [];
  for (var key in iVL) {
    V++;
    visited[key] = false;
  }
  for (var key in iEL) E++;

  if (E/2 != V-1) return false; // first condition

  dfs(0);
  for (var key in iVL)
    if (visited[key] === false)
      return false;
  return true; // second condition
}

function IsDAG(iVL, iEL) {
  if (iVL.length == 0) return true;
  if (IsUndirected(iVL, iEL)) return false; // Undirected graph is obviously full of trivial cycles...

  var V = 0;
  for (var key in iVL) V++;

  var M = [];
  for (var i in iVL) {
    M[i] = [];
    for (var j in iVL)
      M[i][j] = 0;
  }
  for (var key in iEL) {
    var u = iEL[key]["u"], v = iEL[key]["v"];
    M[u][v] = 1; // there exist an edge
  }

  for (var k = 0; k < V; k++) // Warshall's algorithm
    for (var i = 0; i < V; i++)
      for (var j = 0; j < V; j++)
        if ((M[i][k] == 1) && (M[k][j] == 1))
          M[i][j] = 1; // indirectly connected

  for (var i = 0; i < V; i++)
    if (M[i][i] == 1)
      return false; // I can go out and come back to I... a cycle...
  return true;
}

function TopoSort(iVL, iEL) {
  if (iVL.length == 0) return {};
  if (!IsDAG(iVL, iEL)) return {};

  function dfs2(u) {
    visited[u] = true;
    for (var key in iEL)
      if ((iEL[key]["u"] === u) && (visited[iEL[key]["v"]] === false))
        dfs2(iEL[key]["v"]);
    order.unshift(u);
  }

  var visited = [], order = [];
  for (var key in iVL) visited[key] = false;

  for (var key in iVL)
    if (!visited[key])
      dfs2(parseInt(key));
  return order;
}

function RunBellmanFord(iVL, iEL, sourceVertex) {
  if (iVL.length == 0) return {};

  var V = 0, E = 0, d = {}, virus = [];
  for (var key in iVL) { V++; d[key] = 999; virus[key] = false; }
  d[parseInt(sourceVertex)] = 0;
  for (var key in iEL) E++;

  for (var i = 1; i < V; i++) // V-1 passes of Bellman Ford's
    for (var key in iEL) {
      var u = iEL[key]["u"], v = iEL[key]["v"], w = iEL[key]["w"];
      if ((d[u] != 999) && (w != 999) && (d[u]+w < d[v])) d[v] = d[u]+w;
    }

  function dfs(u) {
    virus[u] = true;
    for (var key in iEL)
      if ((iEL[key]["u"] === u) && (virus[iEL[key]["v"]] === false))
        dfs(iEL[key]["v"]);
  }

  var hasNegativeCycle = false;
  for (var key in iEL) {
    var u = iEL[key]["u"], v = iEL[key]["v"], w = iEL[key]["w"];
    if ((d[u] != 999) && (d[u]+w < d[v])) {
      dfs(u);
      hasNegativeCycle = true;
    }
  }

  if (hasNegativeCycle) for (var key in iVL) if (virus[key]) d[key] = "??";
  return d;
}

function HasNegativeWeightCycle(iVL, iEL, sourceVertex) {
  if (iVL.length == 0) return false;

  var V = 0, E = 0, d = {};
  for (var key in iVL) { V++; d[key] = 999; }
  d[parseInt(sourceVertex)] = 0;
  for (var key in iEL) E++;

  for (var i = 1; i < V; i++) // V-1 passes of Bellman Ford's
    for (var key in iEL) {
      var u = iEL[key]["u"], v = iEL[key]["v"], w = iEL[key]["w"];
      if ((d[u] != 999) && (w != 999) && (d[u]+w < d[v])) d[v] = d[u]+w;
    }

  var hasNegativeCycle = false;
  for (var key in iEL) {
    var u = iEL[key]["u"], v = iEL[key]["v"], w = iEL[key]["w"];
    if ((d[u] != 999) && (d[u]+w < d[v])) hasNegativeCycle = true;
  }

  return hasNegativeCycle;
}


// Graph Example Constants
var VL = 0;
var EL = 1;
var CP3_4_1 = 0;
var CP3_4_3 = 1;
var CP3_4_4 = 2;
var CP3_4_9 = 3;
var CP3_4_10 = 4;
var CP3_4_14 = 5;
var CP3_4_17 = 6;
var CP3_4_18 = 7;
var CP3_4_19 = 8;
var CP3_4_24 = 9;
var CP3_4_26_1 = 10;
var CP3_4_26_2 = 11;
var CP3_4_26_3 = 12;
var CP3_4_40 = 13;
var K5 = 14;
var RAIL = 15;
var TESSELLATION = 16;
var BELLMANFORD_KILLER = 17;
var DIJKSTRA_KILLER = 18;
var DAG = 19;
var FORDFULKERSON_KILLER = 20;
var DINIC_SHOWCASE = 21;

function getExampleGraph(id, mode) {
  if (id == CP3_4_1) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 300, "y":  50 },
      2: { "x": 300, "y": 150 },
      3: { "x": 400, "y":  50 },
      4: { "x": 500, "y":  50 },
      5: { "x": 600, "y":  50 },
      6: { "x": 500, "y": 150 },
      7: { "x": 400, "y": 150 },
      8: { "x": 600, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 1 },
      1: { "u": 1, "v": 0, "w": 1 },
      2: { "u": 1, "v": 2, "w": 1 },
      3: { "u": 1, "v": 3, "w": 1 },
      4: { "u": 2, "v": 1, "w": 1 },
      5: { "u": 2, "v": 3, "w": 1 },
      6: { "u": 3, "v": 1, "w": 1 },
      7: { "u": 3, "v": 2, "w": 1 },
      8: { "u": 3, "v": 4, "w": 1 },
      9: { "u": 4, "v": 3, "w": 1 },
     10: { "u": 6, "v": 7, "w": 1 },
     11: { "u": 6, "v": 8, "w": 1 },
     12: { "u": 7, "v": 6, "w": 1 },
     13: { "u": 8, "v": 6, "w": 1 }
    };
  }
  else if (id == CP3_4_3) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 300, "y":  50 },
      2: { "x": 400, "y":  50 },
      3: { "x": 500, "y":  50 },
      4: { "x": 200, "y": 150 },
      5: { "x": 300, "y": 150 },
      6: { "x": 400, "y": 150 },
      7: { "x": 500, "y": 150 },
      8: { "x": 200, "y": 250 },
      9: { "x": 200, "y": 350 },
     10: { "x": 300, "y": 350 },
     11: { "x": 400, "y": 350 },
     12: { "x": 500, "y": 350 }
    };
    else if (mode == EL) return {
      0: { "u":  0, "v":  1, "w": 1 },
      1: { "u":  0, "v":  4, "w": 1 },
      2: { "u":  1, "v":  0, "w": 1 },
      3: { "u":  1, "v":  2, "w": 1 },
      4: { "u":  1, "v":  5, "w": 1 },
      5: { "u":  2, "v":  1, "w": 1 },
      6: { "u":  2, "v":  3, "w": 1 },
      7: { "u":  2, "v":  6, "w": 1 },
      8: { "u":  3, "v":  2, "w": 1 },
      9: { "u":  3, "v":  7, "w": 1 },
     10: { "u":  4, "v":  0, "w": 1 },
     11: { "u":  4, "v":  8, "w": 1 },
     12: { "u":  5, "v":  1, "w": 1 },
     13: { "u":  5, "v":  6, "w": 1 },
     14: { "u":  5, "v": 10, "w": 1 },
     15: { "u":  6, "v":  2, "w": 1 },
     16: { "u":  6, "v":  5, "w": 1 },
     17: { "u":  6, "v": 11, "w": 1 },
     18: { "u":  7, "v":  3, "w": 1 },
     19: { "u":  7, "v": 12, "w": 1 },
     20: { "u":  8, "v":  4, "w": 1 },
     21: { "u":  8, "v":  9, "w": 1 },
     22: { "u":  9, "v":  8, "w": 1 },
     23: { "u":  9, "v": 10, "w": 1 },
     24: { "u": 10, "v":  5, "w": 1 },
     25: { "u": 10, "v":  9, "w": 1 },
     26: { "u": 10, "v": 11, "w": 1 },
     27: { "u": 11, "v":  6, "w": 1 },
     28: { "u": 11, "v": 10, "w": 1 },
     29: { "u": 11, "v": 12, "w": 1 },
     30: { "u": 12, "v":  7, "w": 1 },
     31: { "u": 12, "v": 11, "w": 1 }
    };
  }
  else if (id == CP3_4_4) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 300, "y":  50 },
      2: { "x": 300, "y": 150 },
      3: { "x": 400, "y":  50 },
      4: { "x": 500, "y":  50 },
      5: { "x": 600, "y":  50 },
      6: { "x": 400, "y": 150 },
      7: { "x": 500, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u":  0, "v":  1, "w": 1 },
      1: { "u":  0, "v":  2, "w": 1 },
      2: { "u":  1, "v":  2, "w": 1 },
      3: { "u":  1, "v":  3, "w": 1 },
      4: { "u":  2, "v":  3, "w": 1 },
      5: { "u":  2, "v":  5, "w": 1 },
      6: { "u":  3, "v":  4, "w": 1 },
      7: { "u":  7, "v":  6, "w": 1 },
    };
  }
  else if (id == CP3_4_9) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 300, "y":  50 },
      2: { "x": 300, "y": 150 },
      3: { "x": 400, "y":  50 },
      4: { "x": 500, "y":  50 },
      5: { "x": 600, "y":  50 },
      6: { "x": 500, "y": 150 },
      7: { "x": 600, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 1 },
      1: { "u": 1, "v": 3, "w": 1 },
      2: { "u": 3, "v": 2, "w": 1 },
      3: { "u": 2, "v": 1, "w": 1 },
      4: { "u": 3, "v": 4, "w": 1 },
      5: { "u": 4, "v": 5, "w": 1 },
      6: { "u": 5, "v": 7, "w": 1 },
      7: { "u": 7, "v": 6, "w": 1 },
      8: { "u": 6, "v": 4, "w": 1 }
    };
  }
  else if (id == CP3_4_10) {
    if (mode == VL) return {
      0: { "x": 200, "y": 150 },
      1: { "x": 300, "y":  50 },
      2: { "x": 400, "y": 150 },
      3: { "x": 300, "y": 250 },
      4: { "x": 200, "y": 350 } 
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 4 },
      1: { "u": 0, "v": 2, "w": 4 },
      2: { "u": 0, "v": 3, "w": 6 },
      3: { "u": 0, "v": 4, "w": 6 },
      4: { "u": 1, "v": 2, "w": 2 },
      5: { "u": 2, "v": 3, "w": 8 },
      6: { "u": 3, "v": 4, "w": 9 }
    };
  }
  else if (id == CP3_4_14) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 350, "y": 200 },
      2: { "x": 350, "y":  50 },
      3: { "x": 500, "y": 200 },
      4: { "x": 350, "y": 350 },
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w":  9 },
      1: { "u": 0, "v": 2, "w": 75 },
      2: { "u": 1, "v": 2, "w": 95 },
      3: { "u": 1, "v": 3, "w": 19 },
      4: { "u": 1, "v": 4, "w": 42 },
      5: { "u": 2, "v": 3, "w": 51 },
      6: { "u": 3, "v": 4, "w": 31 }
    };
  }
  else if (id == CP3_4_17) {
    if (mode == VL) return {
      0: { "x": 315, "y": 120 },
      1: { "x": 200, "y":  50 },
      2: { "x": 355, "y": 195 },
      3: { "x": 490, "y":  50 },
      4: { "x": 370, "y": 290 }
    };
    else if (mode == EL) return {
      0: { "u": 1, "v": 4, "w": 6 },
      1: { "u": 1, "v": 3, "w": 3 },
      2: { "u": 0, "v": 1, "w": 2 },
      3: { "u": 2, "v": 4, "w": 1 },
      4: { "u": 0, "v": 2, "w": 6 },
      5: { "u": 3, "v": 4, "w": 5 },
      6: { "u": 0, "v": 3, "w": 7 }
    };
  }
  else if (id == CP3_4_18) {
    if (mode == VL) return {
      0: { "x": 200, "y": 125 },
      1: { "x": 300, "y":  50 },
      2: { "x": 300, "y": 200 },
      3: { "x": 400, "y": 125 },
      4: { "x": 500, "y": 125 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w":   1 },
      1: { "u": 1, "v": 3, "w":   2 },
      2: { "u": 3, "v": 4, "w":   3 },
      3: { "u": 0, "v": 2, "w":  10 },
      4: { "u": 2, "v": 3, "w": -10 }
    };
  }
  else if (id == CP3_4_19) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 300, "y":  50 },
      2: { "x": 400, "y":  50 },
      3: { "x": 500, "y":  50 },
      4: { "x": 300, "y": 125 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w":  99 },
      1: { "u": 1, "v": 2, "w":  15 },
      2: { "u": 2, "v": 1, "w": -42 },
      3: { "u": 2, "v": 3, "w":  10 },
      4: { "u": 0, "v": 4, "w": -99 },
    };
  }
  else if (id == CP3_4_24) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 400, "y":  50 },
      2: { "x": 200, "y": 250 },
      3: { "x": 400, "y": 250 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 4 },
      1: { "u": 1, "v": 3, "w": 8 },
      2: { "u": 0, "v": 2, "w": 8 },
      3: { "u": 2, "v": 3, "w": 3 },
      4: { "u": 2, "v": 1, "w": 1 },
      5: { "u": 1, "v": 2, "w": 1 }
    };
  }
  else if (id == CP3_4_26_1) {
    if (mode == VL) return {
      0: { "x": 200, "y": 150 },
      1: { "x": 400, "y": 250 },
      2: { "x": 300, "y":  50 },
      3: { "x": 300, "y": 250 },
      4: { "x": 500, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 2, "w": 5 },
      1: { "u": 0, "v": 3, "w": 3 },
      2: { "u": 2, "v": 3, "w": 3 },
      3: { "u": 3, "v": 1, "w": 5 },
      4: { "u": 2, "v": 1, "w": 3 },
      5: { "u": 2, "v": 4, "w": 3 },
      6: { "u": 1, "v": 4, "w": 7 }
    };
  }
  else if (id == CP3_4_26_2) {
    if (mode == VL) return {
      0: { "x": 200, "y": 150 },
      1: { "x": 400, "y": 250 },
      2: { "x": 300, "y":  50 },
      3: { "x": 300, "y": 250 },
      4: { "x": 500, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 2, "w": 5 },
      1: { "u": 0, "v": 3, "w": 3 },
      2: { "u": 2, "v": 3, "w": 3 },
      3: { "u": 3, "v": 1, "w": 5 },
      4: { "u": 2, "v": 1, "w": 3 },
      5: { "u": 2, "v": 4, "w": 3 },
      6: { "u": 1, "v": 4, "w": 4 }
    };
  }
  else if (id == CP3_4_26_3) {
    if (mode == VL) return {
      0: { "x": 200, "y": 150 },
      1: { "x": 400, "y": 250 },
      2: { "x": 300, "y":  50 },
      3: { "x": 300, "y": 250 },
      4: { "x": 500, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 2, "w": 5 },
      1: { "u": 0, "v": 3, "w": 3 },
      2: { "u": 3, "v": 1, "w": 5 },
      3: { "u": 2, "v": 1, "w": 2 },
      4: { "u": 2, "v": 4, "w": 2 },
      5: { "u": 1, "v": 4, "w": 7 }
    };
  }
  else if (id == CP3_4_40) {
    if (mode == VL) return {
      0: { "x": 300, "y":  50 },
      1: { "x": 400, "y": 150 },
      2: { "x": 400, "y": 350 },
      3: { "x": 300, "y": 250 },
      4: { "x": 200, "y": 350 },
      5: { "x": 200, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 2 },
      1: { "u": 0, "v": 5, "w": 4 },
      2: { "u": 1, "v": 0, "w": 2 },
      3: { "u": 1, "v": 3, "w": 9 },
      4: { "u": 2, "v": 3, "w": 5 },
      5: { "u": 3, "v": 1, "w": 9 },
      6: { "u": 3, "v": 2, "w": 5 },
      7: { "u": 3, "v": 4, "w": 1 },
      8: { "u": 4, "v": 3, "w": 1 },
      9: { "u": 5, "v": 0, "w": 4 },
    };
  }
  else if (id == K5) {
    if (mode == VL) return {
      0: { "x": 280, "y": 150 },
      1: { "x": 620, "y": 150 },
      2: { "x": 350, "y": 340 },
      3: { "x": 450, "y":  50 },
      4: { "x": 550, "y": 340 },
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 24 },
      1: { "u": 0, "v": 2, "w": 13 },
      2: { "u": 0, "v": 3, "w": 13 },
      3: { "u": 0, "v": 4, "w": 22 },
      4: { "u": 1, "v": 2, "w": 22 },
      5: { "u": 1, "v": 3, "w": 13 },
      6: { "u": 1, "v": 4, "w": 13 },
      7: { "u": 2, "v": 3, "w": 19 },
      8: { "u": 2, "v": 4, "w": 14 },
      9: { "u": 3, "v": 4, "w": 19 }
    };
  }
  else if (id == RAIL) {
    if (mode == VL) return {
      0: { "x":  50, "y":  50 },
      1: { "x": 200, "y":  50 },
      2: { "x": 350, "y":  50 },
      3: { "x": 500, "y":  50 },
      4: { "x": 650, "y":  50 },
      5: { "x":  50, "y": 200 },
      6: { "x": 200, "y": 200 },
      7: { "x": 350, "y": 200 },
      8: { "x": 500, "y": 200 },
      9: { "x": 650, "y": 200 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 10 },
      1: { "u": 1, "v": 2, "w": 10 },
      2: { "u": 1, "v": 6, "w":  8 },
      3: { "u": 1, "v": 7, "w": 13 },
      4: { "u": 2, "v": 3, "w": 10 },
      5: { "u": 2, "v": 7, "w":  8 },
      6: { "u": 2, "v": 8, "w": 13 },
      7: { "u": 3, "v": 4, "w": 10 },
      8: { "u": 3, "v": 8, "w":  8 },
      9: { "u": 5, "v": 6, "w": 10 },
     10: { "u": 6, "v": 7, "w": 10 },
     11: { "u": 7, "v": 8, "w": 10 },
     12: { "u": 8, "v": 9, "w": 10 }
    };
  }
  else if (id == TESSELLATION) {
    if (mode == VL) return {
      0: { "x": 200, "y":  50 },
      1: { "x": 200, "y": 170 },
      2: { "x": 350, "y": 110 },
      3: { "x": 500, "y": 170 },
      4: { "x": 275, "y": 290 },
      5: { "x": 500, "y": 290 },
      6: { "x": 600, "y":  50 },
      7: { "x": 640, "y": 240 },
      8: { "x": 700, "y": 120 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w":  8 },
      1: { "u": 0, "v": 2, "w": 12 },
      2: { "u": 1, "v": 2, "w": 13 },
      3: { "u": 1, "v": 3, "w": 25 },
      4: { "u": 1, "v": 4, "w":  9 },
      5: { "u": 2, "v": 3, "w": 14 },
      6: { "u": 2, "v": 6, "w": 21 },
      7: { "u": 3, "v": 4, "w": 20 },
      8: { "u": 3, "v": 5, "w":  8 },
      9: { "u": 3, "v": 6, "w": 12 },
     10: { "u": 3, "v": 7, "w": 12 },
     11: { "u": 3, "v": 8, "w": 16 },
     12: { "u": 4, "v": 5, "w": 19 },
     13: { "u": 5, "v": 7, "w": 11 },
     14: { "u": 6, "v": 8, "w": 11 },
     15: { "u": 7, "v": 8, "w":  9 }
    };
  }
  else if (id == BELLMANFORD_KILLER) {
    if (mode == VL) return {
      0: { "x": 200, "y": 50 },
      1: { "x": 275, "y": 50 },
      2: { "x": 350, "y": 50 },
      3: { "x": 425, "y": 50 },
      4: { "x": 500, "y": 50 },
      5: { "x": 575, "y": 50 },
      6: { "x": 650, "y": 50 }
    };
    else if (mode == EL) return {
      0: { "u": 5, "v": 6, "w": 1 },
      1: { "u": 4, "v": 5, "w": 2 },
      2: { "u": 3, "v": 4, "w": 3 },
      3: { "u": 2, "v": 3, "w": 4 },
      4: { "u": 1, "v": 2, "w": 5 },
      5: { "u": 0, "v": 1, "w": 6 }
    };
  }
  else if (id == DIJKSTRA_KILLER) {
    if (mode == VL) return {
      0: { "x": 200, "y": 150 },
      1: { "x": 250, "y":  50 },
      2: { "x": 300, "y": 150 },
      3: { "x": 350, "y":  50 },
      4: { "x": 400, "y": 150 },
      5: { "x": 450, "y":  50 },
      6: { "x": 500, "y": 150 },
      7: { "x": 550, "y":  50 },
      8: { "x": 600, "y": 150 },
      9: { "x": 650, "y":  50 },
     10: { "x": 700, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 1, "v":  2, "w": -32 },
      1: { "u": 3, "v":  4, "w": -16 },
      2: { "u": 5, "v":  6, "w":  -8 },
      3: { "u": 7, "v":  8, "w":  -4 },
      4: { "u": 9, "v": 10, "w":  -2 },
      5: { "u": 0, "v":  2, "w":   0 },
      6: { "u": 2, "v":  4, "w":   0 },
      7: { "u": 4, "v":  6, "w":   0 },
      8: { "u": 6, "v":  8, "w":   0 },
      9: { "u": 8, "v": 10, "w":   0 },
     10: { "u": 8, "v":  9, "w":   1 },
     11: { "u": 6, "v":  7, "w":   2 },
     12: { "u": 4, "v":  5, "w":   4 },
     13: { "u": 2, "v":  3, "w":   8 },
     14: { "u": 0, "v":  1, "w":  16 }
    };
  }
  else if (id == DAG) {
    if (mode == VL) return {
      0: { "x": 280, "y": 110 },
      1: { "x": 400, "y":  50 },
      2: { "x": 200, "y": 250 },
      3: { "x": 500, "y": 110 },
      4: { "x": 500, "y": 250 },
      5: { "x": 600, "y":  50 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w":  1 },
      1: { "u": 0, "v": 2, "w":  7 },
      2: { "u": 1, "v": 3, "w":  9 },
      3: { "u": 1, "v": 5, "w": 15 },
      4: { "u": 2, "v": 4, "w":  4 },
      5: { "u": 3, "v": 4, "w": 10 },
      6: { "u": 3, "v": 5, "w":  5 },
      7: { "u": 4, "v": 5, "w":  3 }
    };
  }
  else if (id == FORDFULKERSON_KILLER) {
    if (mode == VL) return {
      0: { "x": 200, "y": 150 },
      1: { "x": 300, "y": 250 },
      2: { "x": 300, "y":  50 },
      3: { "x": 400, "y": 150 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 1, "w": 8 },
      1: { "u": 0, "v": 2, "w": 8 },
      2: { "u": 1, "v": 3, "w": 8 },
      3: { "u": 2, "v": 3, "w": 8 },
      4: { "u": 2, "v": 1, "w": 1 }
    };
  }
  else if (id == DINIC_SHOWCASE) {
    if (mode == VL) return {
      0: { "x": 100, "y": 100 },
      1: { "x": 400, "y":  50 },
      2: { "x": 400, "y": 150 },
      3: { "x": 300, "y": 200 },
      4: { "x": 250, "y": 250 },
      5: { "x": 200, "y": 300 },
      6: { "x": 500, "y": 200 },
      7: { "x": 550, "y": 250 },
      8: { "x": 600, "y": 300 },
      9: { "x": 700, "y": 100 }
    };
    else if (mode == EL) return {
      0: { "u": 0, "v": 9, "w": 7 },
      1: { "u": 0, "v": 1, "w": 5 },
      2: { "u": 1, "v": 9, "w": 4 },
      3: { "u": 0, "v": 2, "w": 8 },
      4: { "u": 2, "v": 9, "w": 9 },
      5: { "u": 0, "v": 3, "w": 3 },
      6: { "u": 3, "v": 6, "w": 1 },
      7: { "u": 6, "v": 9, "w": 1 },
      8: { "u": 0, "v": 4, "w": 3 },
      9: { "u": 4, "v": 7, "w": 4 },
     10: { "u": 7, "v": 9, "w": 6 },
     11: { "u": 0, "v": 5, "w": 7 },
     12: { "u": 5, "v": 8, "w": 6 },
     13: { "u": 8, "v": 9, "w": 5 }
    };
  }
}