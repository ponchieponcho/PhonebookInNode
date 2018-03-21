var http = require('http');
const readline = require('readline');
const fs = require('fs');
var request = require('request');

var pbFileName = 'myjsonfile.json';
var phoneBook = [];
var lastId = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


var contacts = {
    "firstName":"Aaron",
    "phoneNumber":"404-312-1046",
    "id":"0"
}

// var readContacts = function (callback) {
//     fs.readFile(pbFileName, (err, data)=> {
//         var json =  JSON.parse(data);
//         phoneBook = JSON.stringify(json)
//         callback(phoneBook);
//     })
// }

// var server = http.createServer(function (request, response) {
//     console.log(request.method, request.url)
//     if (request.method === "GET") {
//        readContacts(
//            function (data) {
//                response.end(data)
//            }
//     )

//     } else if (request.method === "POST") {
//         var body = '';
//         request.on('data', function (chunk) {
//             body += chunk.toString();
//         })
//         request.on('end', function(){
//             var contact = JSON.parse(body)
//             contact.id = ++lastId;
//             contacts.push(contact)
//             response.end(JSON.stringify(contacts))
//         })

//     } else if (request.method === "PUT") {
//         console.log('Put')
//     } else if (request.method === "DELETE") {
//         console.log('Delete')
//     }

// }).listen(5000);

var readContacts = function (callback) {
    fs.readFile(pbFileName, (err, data)=> {
        var json =  JSON.parse(data);
        // var stringJson = JSON.stringify(json)
        callback(json);
    })
}

var writeContacts = function (content) { 
    // console.log(content)
    var tempPhoneBook = [];
    readContacts(
        function (data) {
            tempPhoneBook.push(data)
            tempPhoneBook.push(content)
            console.log(tempPhoneBook)
            fs.writeFile(pbFileName, JSON.stringify(tempPhoneBook), function (err) {
            if (err) throw err;       
            })
        })
}

var server = http.createServer(function (request, response) {
    console.log(request.method, request.url)
    if (request.method === "GET") {
       readContacts(
           function (data) {
               response.end(JSON.stringify(data))
           }
    )

    } else if (request.method === "POST") {
        var body = '';
        request.on('data', function (chunk) {
            body += chunk.toString();
        })
        request.on('end', function(){
            var parseBody = JSON.parse(body)
            writeContacts(parseBody);
            response.end()
        })

    } else if (request.method === "PUT") {
        console.log('Put')
    } else if (request.method === "DELETE") {
        console.log('Delete')
    }
}).listen(5000);

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
                    phoneBook.push({ 'firstName': name, 'phoneNumber': phone });
                    console.log('Entry stored for ' + name);
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
