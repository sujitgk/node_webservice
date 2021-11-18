require("dotenv").config();
const User = require("./model/user");
const Client = require("./model/client");
require("./config/database").connect();
const express = require("express");
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

//const low = require("lowdb");
//const FileSync = require("lowdb/adapters/FileSync");
//const {join} = require('path');
//const morgan = require("morgan");
//const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
//const docs = require('./docs');

//const YAML = require('yamljs');

const app = express();

//const swaggerDoc = YAML.load('./api/swagger.yaml');
app.use(express.json());

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

app.post("/register", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;
//console.log(first_name);
    // Validate user input
   // console.log('ddd');
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      summery,
      phone,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

  
  // Login
  app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });

  app.post("/getContactbyEmail", auth, async (req, res) => {

    // Our contact logic starts here
    try {
      // Get user input
      const { email } = req.body;
  
      // Validate user input
      if (!(email)) {
        res.status(400).send("Please enter email");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user) {
          
        // user
        res.status(200).json(user);
      }
      res.status(400).send("Invalid Email");
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });

  app.post("/getClientList", auth, async (req, res) => {

    // Our contact logic starts here
    try {
     
      const clients = await Client.find({});

      const clientMap = {};
      clients.forEach((client) => {
        clientMap[client._id] = client;
      });

      
      if (clients) {
          
        res.status(200).json(clientMap);
      }
      else{
        res.status(200).send();
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong. Please contact admin");
    }
    // Our register logic ends here
  });

// Logic goes here

module.exports = app;