/**
 * Created by jack on 8/11/16.
 */
var request = require('request');

for (var i = 0; i < 5; i++) {
    request.post({
        url: 'http://127.0.0.1:3000',
        json: {"owner": "bottle" + i, "type": "male", "content": "content" + i}
    });
}
// (function (i, request) {
//     request.post({
//         url: 'http://127.0.0.1:3000',
//         json: {"owner": "bottle" + i, "type": "male", "content": "content" + i}
//     });
// }(i, request))

for (var i = 6; i < 10; i++) {
    request.post({
        url: 'localhost:3000',
        json: {"owner": "bottle" + i, "type": "female", "content": "content" + i}
    });
}
