var app = require("express")();
var http = require("http").createServer(app);

const PORT = 8080; // Server's port

// Initialize the socket server
var io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000", // Allow the client's origin,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Read the channels list from text file
var fs = require("fs");
var channels = JSON.parse(fs.readFileSync("channels.json", "utf8"));

// Logged in users list
var loggedInUsers = [];

// Allow Cross origins
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Start listenning to the port
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// On connection event
io.on("connection", (socket) => {
  console.log("new client connected");

  // Send connection event to client
  socket.emit("connection", null);

  // Join channel event comming from the client
  socket.on("channel-join", (id) => {
    console.log("channel join", id);

    channels.forEach((c) => {
      if (c.id === id) {
        if (c.sockets.indexOf(socket.id) === -1) {
          // New client in the channel, adding client socketId
          c.sockets.push(socket.id);
          c.participants++;
          io.emit("channel", c); // Invoke the client with the channel event
        }
      } else {
        // If the socketId of the client already exist it means we want to remove the socket from the channel
        let index = c.sockets.indexOf(socket.id);
        if (index !== -1) {
          c.sockets.splice(index, 1);
          c.participants--;
          io.emit("channel", c);
        }
      }
    });

    return id;
  });

  // Send message event to the clients of the channel
  socket.on("send-message", (message) => {
    io.emit("message", message);
  });

  // Disconnect event, remove client from all channels
  socket.on("disconnect", () => {
    channels.forEach((c) => {
      let index = c.sockets.indexOf(socket.id);
      if (index !== -1) {
        c.sockets.splice(index, 1);
        c.participants--;
        io.emit("channel", c);
      }
    });
  });
});

// Send channels list to the client
app.get("/getChannels", (req, res) => {
  res.json({
    channels: channels,
  });
});

// Add new user
app.get("/addUser", (req, res) => {
  const userName = req.query.userName;
  const password = req.query.password;

  var fs = require("fs");
  try {
    var data = fs.readFileSync("users.json", "utf8");

    var json = JSON.parse(data);
    var userExist = false;
    json.forEach((u) => {
      // Check if the new user already exists in the users list
      let index = u.userName.indexOf(userName);
      if (index !== -1) {
        userExist = true;
      }
    });

    if (userExist === false) {
      // User doesn't exist, add it to the list
      var newElement = { userName: userName, password: password };
      json.push(newElement);

      fs.writeFileSync("users.json", JSON.stringify(json));
      res.json({ message: "OK" });
    } else {
      // User exists, do nothing
      res.json({ message: "USER EXIST" });
    }
  } catch (ex) {
    console.log(ex);
    res.json({ message: "FAILED" });
  }
});

// Delete user
app.get("/deleteUser", (req, res) => {
  const userName = req.query.userName;

  var fs = require("fs");
  try {
    var data = fs.readFileSync("users.json", "utf8");
    var found = false;
    var json = JSON.parse(data);
    for (let [i, user] of json.entries()) {
      if (user.userName === userName) {
        found = true;
        json.splice(i, 1);
        break;
      }
    }

    fs.writeFileSync("users.json", JSON.stringify(json));
    res.json({ message: found ? "OK" : "FAILED" });
  } catch (ex) {
    console.log(ex);
    res.json({ message: "FAILED" });
  }
});

// Get all users list
app.get("/getUsers", (req, res) => {
  var fs = require("fs");
  try {
    var data = fs.readFileSync("users.json", "utf8");
    res.json({ message: data });
  } catch (ex) {
    console.log(ex);
    res.json({ message: "FAILED" });
  }
});

// Get a specific user
app.get("/getUser", (req, res) => {
  const userName = req.query.userName;

  var fs = require("fs");
  try {
    var data = fs.readFileSync("users.json", "utf8");
    var json = JSON.parse(data);

    var element = {};
    for (let [i, user] of json.entries()) {
      if (user.userName === userName) {
        element = user;
        break;
      }
    }

    res.json({ message: JSON.stringify(element) });
  } catch (ex) {
    console.log(ex);
    res.json({ message: "FAILED" });
  }
});

// Login
app.get("/login", (req, res) => {
  const userName = req.query.userName;
  const password = req.query.password;

  var fs = require("fs");
  try {
    var result = false;
    var userExist = false;
    var data = fs.readFileSync("users.json", "utf8");
    var json = JSON.parse(data);
    var reason = "";
    var existUserLoggedIn = false;

    for (let [i, user] of json.entries()) {
      if (user.userName === userName && user.password === password) {
        
        //Check if users already logged in from loggedInUsers list
        for (let user of loggedInUsers) {
          if (user === userName) {
            existUserLoggedIn = true;
            break;
          }
        }

        if (existUserLoggedIn === false) { // OK for login
          const session = require("express-session");
          session.userName = userName;
          result = true;
          loggedInUsers.push(userName);
        } else { // User already logged in
          reason = "User already logged in";
        }

        break;
      } else if (user.userName === userName) {
        // User already exist flag
        userExist = true;
        break;
      }
    }

    if (
      result === false &&
      userExist === false &&
      existUserLoggedIn === false
    ) {
      // If user not exists consider as registration and add to users list
      var newElement = { userName: userName, password: password };
      json.push(newElement);
      fs.writeFileSync("users.json", JSON.stringify(json));
      result = true;
    }
    
    res.json({ message: result, reason: reason });

  } catch (ex) {
    console.log(ex);
    res.json({ message: "FAILED" });
  }
});

// Logout
app.get("/logout", (req, res) => {

  var userName = req.query.userName;
  
  // Removing the user from the loggedIn user list
  if (loggedInUsers.length > 0) {
    
    var index = -1;
    for (let [i, user] of loggedInUsers.entries()) {
      if (user === userName) {
        index = i;
        break;
      }
    }
    if (index > -1) loggedInUsers.splice(index, 1);

    const session = require("express-session");
    session.userName = null;
  }

  res.json({ message: "OK" });

});
