exports.combineLists = function(list1, list2, list3) {
  var outputList = new Array();
  if (list1 && list2 && list3) {
    return combineList(combineList(list1, list2), list3);
  }
  if (list1) {
    outputList = list1;
  }
  if (list2) {
    outputList = combineList(outputList, list2);
  }
  if (list3) {
    outputList = combineList(outputList, list3);
  }
  return outputList;
}

function combineList(list1, list2) {
  if (list1 === 'undefined') return list2;
  if (list2 === 'undefined') return list1;

  var output = new Array();
  var l1Count = list1.length;
  var l2Count = list2.length;
  var currentl1Position = 0;
  var currentl2Position = 0;

  while (currentl1Position < l1Count && currentl2Position < l2Count) {
    if (list1[currentl1Position].message == list2[currentl2Position].message) {
      var temp = list1[currentl1Position];
      temp.message = "There was a combined SM " + list1[currentl1Position].message;
      output.push(temp);
      currentl1Position++;
      currentl2Position++;
    } else {
      if (list1[currentl1Position].updatedTimeValue > list2[currentl2Position].updatedTimeValue) {
        output.push(list1[currentl1Position]);
        currentl1Position++;
      } else {
        output.push(list2[currentl2Position]);
        currentl2Position++;
      }
    }
  }

  while (currentl1Position < l1Count) {
    output.push(list1[currentl1Position]);
    currentl1Position++;
  }
  while (currentl2Position < l2Count) {
    output.push(list2[currentl2Position]);
    currentl2Position++;
  }
  return output;
}
