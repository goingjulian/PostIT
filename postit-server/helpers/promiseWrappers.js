const fs = require('fs');

module.exports.readFileP = filePath => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    })
}

module.exports.unlinkP = filePath => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, 'utf8', (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}