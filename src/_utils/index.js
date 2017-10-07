function doArraysMatch(array1, array2) {
    if (array1.length !== array2.length) {
        return false;
    }
    //every time we find a match we decrement this by 1.
    let matchCounter = array1.length;

    for (var i = 0; i < array1.length; i++) {
        for (var j = 0; j < array2.length; j++) {
            if (array1[i] == array2[j]) {
                matchCounter --; //this arg 1 premis has been matched, decrement, break out this inner loop, and move on to the next arg 1 premis / the end.
                break;
            }
        }
    }

    if (matchCounter == 0) {
        return true;
    }
    return false;
}

function doArgumentsMatch(argumentObject1, argumentObject2){
    //type & array of premises with an _id attribute
    if (argumentObject1.type != argumentObject2.type) {
        return false;
    }

    if (argumentObject1.premises.length != argumentObject2.premises.length) {
        return false;
    }

    let requiredMatchCount = argumentObject1.premises.length;

    for (var p1 = 0; p1 < argumentObject1.premises.length; p1++) {
        for (var p2 = 0; p2 < argumentObject2.premises.length; p2++) {
            if (argumentObject1.premises[p1]._id == argumentObject2.premises[p1]._id) {
                requiredMatchCount --;
            }
        }
    }
    if (requiredMatchCount > 0) {
        return false;
    }

    return true;
}

function getCreateDateForDb(){
    return new Date().toISOString().replace(/T/, ' ').substr(0, 10);
}

module.exports = {
    doArraysMatch,
    doArgumentsMatch,
    getCreateDateForDb
}