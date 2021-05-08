const axios = require('axios');
const apiToken = process.env.API_TOKEN;
const airTableApp = process.env.AIRTABLE_APP;
const airTableName = "note";

exports.list = async function(req, res) {
    let notes = [];
    try{
        const response = await axios.get(`https://api.airtable.com/v0/${airTableApp}/${airTableName}?filterByFormula={userid}='${req.params.userid}'`,
            { headers: { Authorization: "Bearer " + apiToken }});

            notes = response.data.records;
    }
    catch(err){
        console.log(err);
    }
    res.send(notes);
};

exports.create = async function(req, res) {
    
    try{
        let note = req.body;

        //Check if mandatory fields are there
        if(note.fields === undefined){
            throw "Invalid object";
        }
        if(note.fields.title === undefined){
            throw "Invalid object";
        }

        if(note.fields.userid === undefined){
            throw "Invalid object";
        }

        //Create note 
        response = await axios.post(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`,
            note,
            { 
                headers: { 
                    Authorization: "Bearer " + apiToken,
                    'Content-Type': 'application/json'
                }
            });

        res.send("OK");
    }
    catch(err){
        console.log(err);
        res.send(err);
    }
    
};

exports.update = async function(req, res) {
    
    try{
        let note = req.body;
        delete note.createdTime;
    
        let notes = {};
        notes.records = [];
        notes.records.push(note);
        
        const response = await axios.patch(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`,
            notes,
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


