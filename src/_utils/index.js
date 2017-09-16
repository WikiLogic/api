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

function getCreateDateForDb(){
    return new Date().toISOString().replace(/T/, ' ').substr(0, 10);
}

module.exports = {
    doArraysMatch,
    getCreateDateForDb
}