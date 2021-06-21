var app = require('express')();
var http = require('http').createServer(app);

const PORT = 8080;

var io = require('socket.io')(http,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
});

var fs = require('fs');
var channels = JSON.parse(fs.readFileSync('channels.json', 'utf8'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})


http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log('new client connected');
    socket.emit('connection', null);
    socket.on('channel-join', (id) => {
        console.log('channel join', id);
        channels.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    //users[id] = currentUser;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });

        return id;
    });
    socket.on('send-message', message => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        channels.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });

});



/**
 * @description This methos retirves the static channels
 */
app.get('/getChannels', (req, res) => {
    res.json({
        channels: channels
    })
});

// app.get('/test', (req, res) => {
//     res.json({
//         response: 'SUCCESS!!!!'
//     })
// });

app.get('/addUser', (req, res) => {
    
    const userName = req.query.userName;
    const password = req.query.password;
    
    var fs = require('fs');
    try{
       
        var data = fs.readFileSync('users.json', 'utf8');
        
        var json = JSON.parse(data);
        var newElement = {"userName": userName, "password": password};
        json.push(newElement);
        
        fs.writeFileSync('users.json',JSON.stringify(json));
        res.json({message: 'OK'});
    }
    catch(ex){
        console.log(ex);
        res.json({message: 'FAILED'});
    }
    

});

app.get('/deleteUser', (req, res) => {
    
    const userName = req.query.userName;
    
    var fs = require('fs');
    try{
        var data = fs.readFileSync('users.json', 'utf8');
        
        var json = JSON.parse(data);
        for (let [i, user] of json.entries()) {
            if (user.userName === userName) {
                json.splice(i, 1);
            }
         }
        
        fs.writeFileSync('users.json',JSON.stringify(json));
        res.json({message: 'OK'});
    }
    catch(ex){
        console.log(ex);
        res.json({message: 'FAILED'});
    }
    

});

app.get('/getUsers', (req, res) => {
    
    
    var fs = require('fs');
    try{
        var data = fs.readFileSync('users.json', 'utf8');
        res.json({message: data});
    }
    catch(ex){
        console.log(ex);
        res.json({message: 'FAILED'});
    }
    

});

app.get('/getUser', (req, res) => {
    
    
    const userName = req.query.userName;
    
    var fs = require('fs');
    try{
        var data = fs.readFileSync('users.json', 'utf8');
        var json = JSON.parse(data);
        var element = {};
        for (let [i, user] of json.entries()) {
            if (user.userName === userName) {
                element = user;
                break;
            }
         }
        
        
        res.json({message: JSON.parse(element)});
    }
    catch(ex){
        console.log(ex);
        res.json({message: 'FAILED'});
    }
    
    

});

app.get('/login', (req, res) => {
    
    
    const userName = req.query.userName;
    const password = req.query.password;
    
    var fs = require('fs');
    try{
        var result = false;
        var userExist = false;
        var data = fs.readFileSync('users.json', 'utf8');
        var json = JSON.parse(data);

        for (let [i, user] of json.entries()) {
            if (user.userName === userName && user.password === password) {
                const session = require('express-session');
                session.userName = userName;
                result = true;
                break;
            }
            else if(user.userName === userName){
                userExist = true;
                break;
            }
                
         }
         if (result === false && userExist === false){
            var newElement = {"userName": userName, "password": password};
            json.push(newElement);
            fs.writeFileSync('users.json',JSON.stringify(json));
            result = true;
         }
        res.json({message: result});
    }
    catch(ex){
        console.log(ex);
        res.json({message: 'FAILED'});
    }

});

app.get('/logout', (req, res) => {
    
    const session = require('express-session');
    session.userName = null;

});


