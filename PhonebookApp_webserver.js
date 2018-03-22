var http = require('http');
const readline = require('readline');
const fs = require('fs');
var request = require('request');

var pbFileName = 'contacts.json';
var phoneBook = [];
var lastId = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var readContacts = function (callback) {
    fs.readFile(pbFileName, (err, data) => {
        var json = JSON.parse(data);
        callback(json);
    })
}

var writeContacts = function (content) {
    readContacts(
        function (data) {
            data.push(content)
            fs.writeFile(pbFileName, JSON.stringify(data), function (err) {
                if (err) throw err;
            })
        })
}


// var server = http.createServer(function (request, response) {
//     console.log(request.method, request.url)

//     if (request.method === "GET") {
//        readContacts(
//            function (data) {
//                response.end(JSON.stringify(data))
//            }
//     )

//     } else if (request.method === "POST") {
//         

//     } else if (request.method === "PUT") {
//         console.log('Put')
//     } else if (request.method === "DELETE") {
//         console.log('Delete')
//     }
// }).listen(5000);


var getContacts = function (request, response, params) {
    readContacts(
        function (data) {
            response.end(JSON.stringify(data))
        });
}
var postContact = function (request, response, params) {
    var body = '';
        request.on('data', function (chunk) {
            body += chunk.toString();
        })
        request.on('end', function(){
            var parseBody = JSON.parse(body)
            writeContacts(parseBody);
            response.end()
        })
}
var updateContact = function (request, response, params) {
    console.log('update single contact')
}
var deleteContact = function (request, response, params) {
    console.log('delete single contact')
}
var getContact = function (request, response, params) {
    console.log('get single contact')
}
var matches = function (request, method, path) {
    var match = path.exec(request.url);
    return request.method === method && (match && match.slice(1));
}
var notFound = function (request, response) {
    response.statusCode = 404;
    response.end('404 error')
}
let routes = [
    { method: 'GET', path: /^\/contacts\/([0-9]+)$/, handler: getContact },
    { method: 'POST', path: /^\/contacts\/?$/, handler: postContact },
    { method: 'PUT', path: /^\/contacts\/([0-9]+)$/, handler: updateContact },
    { method: 'DELETE', path: /^\/contacts\/?$/, handler: deleteContact },
    { method: 'GET', path: /^\/contacts\/?$/, handler: getContacts }
];

let server = http.createServer((request, response) => {
    console.log(request.method + ' ' + request.url);
    let params = [];
    let matchedRoute;
    for (let route of routes) {
        let match = matches(request, route.method, route.path);
        console.log(match)
        if (match) {
            matchedRoute = route;
            params = match;
            break;
        }
    }
    (matchedRoute ? matchedRoute.handler : notFound)(request, response, params)
}).listen(5000);;

var menu = (`
=====================
Electronic Phone Book
=====================
1. Look up an entry
2. Set an entry
3. Delete an entry
4. List all entries
5. Save entries
6. Restore saved entries
7. Quit`);

var mainMenu = function () {
    console.log(menu)
    // console.log(phoneBook)

    rl.question('What do you want to do (1-7)? ', function (answer) {
        if (answer === '1') { //working
            rl.question('Name: ', function (name) {
                for (var i = 0; i < phoneBook.length; i++) {
                    if (phoneBook[i].firstName === name) {
                        console.log('Found entry for ' + name + ': ' + phoneBook[i].phoneNumber);
                        mainMenu()
                    }
                }
            })
        }

        else if (answer === '2') {
            rl.question('Name: ', function (name) {
                rl.question('Phone Number: ', function (phone) {
                    // phoneBook.push({ 'firstName': name, 'phoneNumber': phone });
                    // console.log('Entry stored for ' + name);
                    let newContact = { 'firstName': name, 'phoneNumber': phone }
                    request.post({
                        url: 'http://localhost/5000',
                        body: JSON.stringify(newContact)
                    }, function (error, response, body) {
                        console.log(body);
                    });
                    mainMenu()
                });
            })
        }

        else if (answer === '3') { //Delete an entry
            console.log('working')

        } else if (answer === '4') { //List all entries
            for (var i = 0; i < phoneBook.length; i++) {
                console.log('Found entry for ' + phoneBook[i].firstName + ': ' + phoneBook[i].phoneNumber)
            }
            mainMenu()
        } else if (answer === '5') { //Save entries
            fs.writeFile(pbFileName, JSON.stringify(phoneBook), function (err) {
                if (err) throw err;
                console.log('Entries saved to ' + pbFileName)
                mainMenu();
            })

        } else if (answer === '6') { //Restore saved entries
            fs.readFile(pbFileName, function (err, data) {
                var json = JSON.parse(data);
                phoneBook = json;
                mainMenu();
            })

        } else if (answer === '7') { //Quit
            console.log('Bye!')
            rl.close();
        }

    });
}

// mainMenu();
