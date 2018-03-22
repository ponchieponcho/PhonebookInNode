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

var getContacts = function (request, response) {
    readContacts(
        function (data) {
            response.end(JSON.stringify(data))
        });
}
var postContact = function (request, response) {
    var body = '';
    request.on('data', function (chunk) {
        body += chunk.toString();
    })
    request.on('end', function () {
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
    let url = request.url.slice(10)
    readContacts(
        function (data) {
            for (let contact of data) {
                if (contact.id === url) {
                    response.end(JSON.stringify(contact))
                }

            }
        });
}

var matches = function (request, method, path) {
    var match = path.exec(request.url);
    return request.method === method && (match && match.slice(1));
}
var notFound = function (request, response) {
    response.statusCode = 404;
    response.end('404 error')
}

let renderIndex = function (request, response) {
    console.log('renderIndex URL: ' + request.url)
    fs.readFile(`static/index.html`, (err, data) => {
        response.end(data)
    })
}

let renderHomepage = function (request, response) {
    console.log('renderHomepage URL: ' + request.url)
    fs.readFile(`static/${request.url}`, (err, data) => {
        response.end(data)
    })
}

let routes = [
    { method: 'GET', path: /^\/contacts\/([0-9]+)$/, handler: getContact },
    { method: 'POST', path: /^\/contacts\/?$/, handler: postContact },
    { method: 'PUT', path: /^\/contacts\/([0-9]+)$/, handler: updateContact },
    { method: 'DELETE', path: /^\/contacts\/?$/, handler: deleteContact },
    { method: 'GET', path: /^\/contacts\/?$/, handler: getContacts },
    { method: 'GET', path: /^\/$/, handler: renderIndex },
    { method: 'GET', path: /^\/([0-9a-zA-Z -.]+)?$/, handler: renderHomepage }
];

let server = http.createServer((request, response) => {
    // console.log(request.method + ' ' + request.url);
    let params = [];
    let matchedRoute;
    for (let route of routes) {
        let match = matches(request, route.method, route.path);
        if (match) {
            matchedRoute = route;
            params = match;
            break;
        }
    }
    (matchedRoute ? matchedRoute.handler : notFound)(request, response, params)
}).listen(3000);;
