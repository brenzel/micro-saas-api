//user.js
const bcrypt = require("bcryptjs");
const axios = require('axios');
const basicAuth = require('basic-auth');
const mailsender = require('./mailsender');

const apiToken = process.env.API_TOKEN;
const airTableApp = process.env.AIRTABLE_APP;
const airTableName = "user";


exports.auth = async function (req, res, next) {
    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      res.sendStatus(401);
      return;
    }

    let response = await axios.get(`https://api.airtable.com/v0/${airTableApp}/${airTableName}?filterByFormula={username}='${user.name}'`,
        { headers: { Authorization: "Bearer " + apiToken }});
    let dbusers = response.data;

    if(dbusers.records.length === 0){
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      res.sendStatus(401);
      return;
    }
    let dbuser = dbusers.records[0];

    if (bcrypt.compareSync(user.pass, dbuser.fields.password)) {
      next();
    } else {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      res.sendStatus(401);
      return;
    }
  }


exports.list = async function(req, res) {
    let users = [];
    try{
        const response = await axios.get(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`,
            { headers: { Authorization: "Bearer " + apiToken }});

        users = response.data.records;
    }
    catch(err){
        console.log(err);
    }
    res.send(users);
};

exports.detail = async function(req, res) {
    let user = {};
    try{
        const response = await axios.get(`https://api.airtable.com/v0/${airTableApp}/${airTableName}?filterByFormula={username}='${req.params.username}'`,
            { headers: { Authorization: "Bearer " + apiToken }});

        user = response.data;
    }
    catch(err){
        console.log(err);
    }
    res.send(user);
};


exports.create = async function(req, res) {
    let user = req.body;

    try{

        //Check if mandatory fields are there
        if(user.fields === undefined){
            throw "Invalid object";
        }
        if(user.fields.username === undefined){
            throw "Invalid object";
        }
        
        //Check valid mail adress
        user.fields.username = user.fields.username.trim().toLowerCase();
        const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!user.fields.username.match(mailformat)) {
            throw "Invalid mail";
        }

        //Check if user already exists
        let response = await axios.get(`https://api.airtable.com/v0/${airTableApp}/${airTableName}?filterByFormula={username}='${user.fields.username}'`,
            { headers: { Authorization: "Bearer " + apiToken }});
        let users = response.data;
        if(users.records.length > 0){
            throw "User already exists";
        }

        //Create password
        const randomstring = Math.random().toString(36).slice(-8);
        user.fields.password = await bcrypt.hash(randomstring, 8);

        //Create user 
        response = await axios.post(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`,
            user,
            { 
                headers: { 
                    Authorization: "Bearer " + apiToken,
                    'Content-Type': 'application/json'
                }
            });

        await mailsender.send('no-reply@ideenstarter.de',user.fields.username, 'Passwort für deinen Account', "Dein Passwort lautet: " + randomstring);

        res.send("OK");
    }
    catch(err){
        console.log(err);
        res.send(err);
    }
    
};

exports.recovery = async function(req, res) {
    let user = req.body;

    try{

        //Check if mandatory fields are there
        if(user.fields === undefined){
            throw "Invalid object";
        }
        if(user.fields.username === undefined){
            throw "Invalid object";
        }
        
        //Check valid mail adress
        user.fields.username = user.fields.username.trim().toLowerCase();
        const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!user.fields.username.match(mailformat)) {
            throw "Invalid mail";
        }

        //Check if user already exists
        let response = await axios.get(`https://api.airtable.com/v0/${airTableApp}/${airTableName}?filterByFormula={username}='${user.fields.username}'`,
            { headers: { Authorization: "Bearer " + apiToken }});
        let users = response.data;

        if(users.records.length === 0){
            throw "User not exists";
        }

        user = users.records[0];

        //Create new password
        const randomstring = Math.random().toString(36).slice(-8);
        user.fields.password = await bcrypt.hash(randomstring, 8);
        delete user.createdTime;


        //Update user 
        response = await axios.patch(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`,
            user,
            { 
                headers: { 
                    Authorization: "Bearer " + apiToken,
                    'Content-Type': 'application/json'
                }
            });

        await mailsender.send('no-reply@ideenstarter.de',user.fields.username, 'Passwort für deinen Account', "Dein Passwort lautet: " + randomstring);

        res.send("OK");
    }
    catch(err){
        console.log(err);
        res.send(err);
    }
    
};

exports.update = async function(req, res) {
    
    try{
        let user = req.body;
        delete user.createdTime;
    
        let users = {};
        users.records = [];
        users.records.push(user);
        
        const response = await axios.patch(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`,
            users,
            { 
                headers: { 
                    Authorization: "Bearer " + apiToken,
                    'Content-Type': 'application/json'
                }
            });
            res.send("OK");
    }
    catch(err){
        console.log(err.response.status);
        console.log(err.response.data.error.message);

        res.send("NOK");
    }
    
    
};

exports.delete = async function(req, res) {
    
    try{
        const response = await axios.delete(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`,
            {
                params: {
                    'records[]': req.params.id
                },
                headers: { 
                    Authorization: "Bearer " + apiToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        res.send("OK");
    }
    catch(err){
        console.log(err);
        res.send("NOK");
    }
    
    
};


