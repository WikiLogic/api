module.expots = function checkIfUnique(newClaimObject){
    return new Promise(function (resolve, reject) {
        db.query(`
            FOR doc IN claims 
                FILTER doc.text == "${newClaimObject.username}""
                RETURN doc
            `).then((cursor) => {

                cursor.all().then((data) => {

                    if (data.length > 0) {
                        resolve(false);
                    } else {
                        resolve(true);   
                    }

                }).catch((err) => {
                    reject(err);
                });

            }).catch((err) => {
                reject(err);
            });
    });
}