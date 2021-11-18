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
const swaggerUI =  require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node web service',
      version: '1.0.0',
    },
  },
  apis: ['app.js'], // files containing annotations as above
};

const swaggerDocs = swaggerJsdoc(options);
//const docs = require('./docs');

//const YAML = require('yamljs');

const app = express();

//const swaggerDoc = YAML.load('./api/swagger.yaml');
app.use(express.json());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
app.get("/", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});


/**
 * @swagger
 * /register:
 *   post:
 *     description: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The user's first_name.
 *                 example: Leanne
 *               last_name:
 *                 type: string
 *                 description: The user's last_name.
 *                 example: Graham
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: example@example.com
 *               summary:
 *                 type: string
 *                 description: The user's summary.
 *                 example: test
 *               phone:
 *                 type: string
 *                 description: The user's phone.
 *                 example: (+91) 987654321
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password@123
 *     responses:
 *       201:
 *        description: "User info"
 *       400:
 *         description: "Need all required fields"
 *       409:
 *         description: "User already exists"
 *       500:
 *         description: "Error"
 */
app.post("/register", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, email, password,phone, summary } = req.body;
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
      summary,
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
    res.status(500).json("Something went wrong. Please contact Admin");
  }
  // Our register logic ends here
});

  
/**
 * @swagger
 * /login:
 *   post:
 *     description: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:          
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: example@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password@123
 *     responses:
 *       201:
 *        description: "User info"
 *       400:
 *         description: "Need all required fields"
 *       401:
 *         description: "Invalid credentials"
 *       500:
 *         description: "Error"
 */
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
      res.status(401).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong. please contact Admin");
    }
    // Our register logic ends here
  });

/**
 * @swagger
 * /contact:
 *   post:
 *     description: Get Contact Details of email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:             
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: example@example.com
 *               token:
 *                 type: string
 *                 description: Auth token returned in login API.
 *     responses:
 *       200:
 *        description: "User info"
 *       400:
 *         description: "Need all required fields"
 *       409:
 *         description: "Invalid email"
 *       500:
 *         description: "Error"
 */
 
app.post("/contact", auth, async (req, res) => {

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
      res.status(409).send("Invalid Email");
    } catch (err) {
      console.log(err);
      res.status(500).send("Something went wrong. please contact Admin");
    }
    // Our register logic ends here
  });

/**
 * @swagger
 * /client:
 *   post:
 *     description: Get all clients
*     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:           
 *               token:
 *                 type: string
 *                 description: Auth token returned in login API.
 *     responses:
 *       200:
 *        description: "client List"
 *       500:
 *         description: "Error"
 */
app.post("/client", auth, async (req, res) => {

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