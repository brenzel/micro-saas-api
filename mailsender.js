const sendmail = require('sendmail')();

exports.send = async function (from, to, subject, body){
    
    return new Promise((resolve,reject)=>{

        sendmail({
            from: from,
            to: to,
            subject: subject,
            html: body,
          }, function(err, reply) {

            if (err) {
                console.log("error is " + err);
                resolve(false); // or use rejcet(false) but then you will have to handle errors
            } 
           else {
                resolve(true);
            }
            
        });  

    })
}