const Discord = require("discord.js");
//const ms = require('ms');
const request = require('request')
const WebSocket = require('ws')
var firebase = require("firebase-admin");


const client = new Discord.Client();

const config = require("./config.json");

     /*const fb = firebase.initializeApp({
      apiKey: "AIzaSyAf4-c9OwQ8lNH1cWaOa3NGbdfuGg_ko0I",
      authDomain: "go-trivia.firebaseapp.com",
      databaseURL: "https://go-trivia.firebaseio.com",
      projectId: "go-trivia",
      storageBucket: "go-trivia.appspot.com",
      messagingSenderId: "417708866066"
  });

 
  */
//VARIABLES
var answer1Count = 0;
var answer2Count = 0;
var answer3Count = 0;
var channelID1 = "474640174916042772";
var channelIDTK = "461063026997592074";
var channelIDTTU = "462834951419723776";
var channelIDTZ = "457245542456754188";
var channelIDTD = "459842150323060736";

//var questionID;
var help = "\n ==== gotrivia HELP ==== \n" +
  "gotrivia.set1 : only grand - sets answer1 data to your choice. \n" +
  "gotrivia.set2 : only grand - sets answer2 data to your choice. \n" +
  "gotrivia.set3 : only grand - sets answer3 data to your choice. \n" +
  "gotrivia.fish : only staff - fishes/gets answers without using website! \n" +
  "gotrivia.setlive : only grand - sets live message to your choice \n" +
  "gotrivia.rq : only q resetters - resets q data \n" +
  "gotrivia.announce : only grand - ANNOUNCES! \n";

 const fb = firebase.initializeApp({
  credential: firebase.credential.cert("./go-trivia-firebase-adminsdk-423v2-a12e825c30.json"),
  databaseURL: "https://go-trivia.firebaseio.com/",
});

function checkIfLive()
{
  x = 5;
    
  /*
    let options = {
      headers: {
        Mg: "x-hq-stk"

      }
  }
  */
  
    request('https://api-quiz.hype.space/shows/now',(error,response,body) => { 
      //requests data from hq api
    body = JSON.parse(body)
    //console.log(body)



    if(!body.active) {
//if game isnt live, resets all answers to 0 every 5 seconds
  fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').once('value').then(gamelive => {
    if (gamelive != null && parseInt(gamelive) != null) {
    fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set("No game live :(" ))
    }
     else {
     fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set(0))
     }
    }))

    answer1Count = 0;
    answer2Count = 0;
    answer3Count = 0;

   //answer 3
   fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
     if (answer3 != null && parseInt(answer3) != null) {
     fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
     }
      else {
      fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
      }
     }))

     //answer 2
     fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
       if (answer2 != null && parseInt(answer2) != null) {
       fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
       }
        else {
        fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
        }
       }))

       //answer 1

       fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer3 => {
         if (answer3 != null && parseInt(answer3) != null) {
         fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
         }
          else {
          fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
          }
         }))
    } 

    else {
      //if game is live, connects to hq websocket


      /*
      fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').once('value').then(gamelive => {
        if (gamelive != null && parseInt(gamelive) != null) {
        fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set("Game live!" ))
        }
         else {
         fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set(0))
         }
        }))
        */
      let socketUrl = body.broadcast.socketUrl
      let options = {
          headers: {
            //hq uk:
            // Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIxMTY0ODgyLCJ1c2VybmFtZSI6ImdyYW5kYnJvd3NlciIsImF2YXRhclVybCI6InMzOi8vaHlwZXNwYWNlLXF1aXovZGVmYXVsdF9hdmF0YXJzL1VudGl0bGVkLTFfMDAwM19yZWQucG5nIiwidG9rZW4iOiJpMUZUYUIiLCJyb2xlcyI6W10sImNsaWVudCI6IiIsImd1ZXN0SWQiOm51bGwsInYiOjEsImlhdCI6MTUzMDA2NDA2NCwiZXhwIjoxNTM3ODQwMDY0LCJpc3MiOiJoeXBlcXVpei8xIn0.uuzI7iQ5H9-x7t0rUbZdRAE39wrM0lIxepNqFbbHJE8",
           //  Mg: "x-hq-stk"

           // hq us:
           Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNDMzMDUxLCJ1c2VybmFtZSI6ImJyaXRpc2hsYWQtIiwiYXZhdGFyVXJsIjoiaHR0cHM6Ly9kMnh1MWhkb21oM25yeC5jbG91ZGZyb250Lm5ldC9kZWZhdWx0X2F2YXRhcnMvVW50aXRsZWQtMV8wMDAzX3JlZC5wbmciLCJ0b2tlbiI6IjB1TXZkcCIsInJvbGVzIjpbXSwiY2xpZW50IjoiaU9TLzEuMy4xNiBiMTA1IiwiZ3Vlc3RJZCI6bnVsbCwidiI6MSwiaWF0IjoxNTM0MTAzNDc4LCJleHAiOjE1NDE4Nzk0NzgsImlzcyI6Imh5cGVxdWl6LzEifQ.GMppfmlVIumj1GcrrzR4-1IHvQSEchTA9WTcl8i8sAk"

          }
      }
      let ws = new WebSocket(socketUrl, options)
      //creates a new websocket instance

      ws.on('open', () => {
        //when the ws is open

      })

      ws.on('message', (data) => {
        //when a message appears
        const gotrivia = "\ngotrivia -  " + data.questionNumber +" \n" +
        "Answer # 1: " +answer1Count + "\n" +
        "Answer # 2: " +answer2Count + "\n" +
        "Answer # 3: " +answer3Count + "\n";
        data = JSON.parse(data)
        if(!data.type=="question")return
        if(data.type=="question") {
          //          console.log(data)
          fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').once('value').then(gamelive => {
            if (gamelive != null && parseInt(gamelive) != null) {
            fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set(`Q${data.questionNumber}/${data.questionCount}` ))
            }
             else {
             fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set(0))
             }
            }))


        
          }
  
          if(data.type=="questionFinished") {
            //          if(data.type=="questionFinished" && questionID == data.questionId) {

//console.log(data)
     answer1Count = 0;
     answer2Count = 0;
     answer3Count = 0;

    //answer 3
    fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
      if (answer3 != null && parseInt(answer3) != null) {
      fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
      }
       else {
       fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
       }
      }))

      //answer 2
      fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
        if (answer2 != null && parseInt(answer2) != null) {
        fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
        }
         else {
         fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
         }
        }))

        //answer 1

        fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer3 => {
          if (answer3 != null && parseInt(answer3) != null) {
          fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
          }
           else {
           fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
           }
          }))

        }
      })
  }
})
//console.log("Loop passed")
    setTimeout(checkIfLive, x*1000);
}
client.on("ready", () => {
  checkIfLive(); 

  console.log(`gotrivia(discord) has started, Guild count: ${client.guilds.size}. CTRL C TO KILL`); 
  client.user.setActivity('gotrivia public beta v0.0.3', {
    type: 'STREAMING'

});
});





client.on("message", message => {
  

  if(message.author.bot) return;
  
  if(message.content.indexOf(config.prefix) !== 0) return;
  

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  


  
if(command == "gotrivia.help") {

  message.author.send(help)
  message.channel.send("DMed.")
}
  
  if(command === "gotrivia.announce") {
    if(!message.member.roles.has("474516678617595914")) {
 message.reply("You need `grand` to use this!");
    }
    else {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
    message.channel.send(sayMessage);
    }
  }

//CROWD SOURCING START


//Testing/Test Server ONLY
/*
  if (command == "1") {
    if (message.channel.id !== channelID1) return;
    answer1Count+=3;
    
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer1 => {
  if (answer1 != null && parseInt(answer1) != null) {
  fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
  }
   else {
   fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
   }
}))
}
if (command == "1?") {
  if (message.channel.id !== channelID1) return;
  answer1Count+=1;
  
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer1 => {
if (answer1 != null && parseInt(answer1) != null) {
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
 }
}))
}

  if (command ==  "2") {
    if (message.channel.id !== channelID1) return;
    answer2Count+=3;
    
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
  if (answer2 != null && parseInt(answer2) != null) {
  fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
  }
   else {
   fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
   }
}))
}

if (command ==  "2?") {
  if (message.channel.id !== channelID1) return;
  answer2Count+=1;
  
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
if (answer2 != null && parseInt(answer2) != null) {
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
 }
}))
}
if (command ==  "3") {
  if (message.channel.id !== channelID1) return;
  answer3Count+=3;
  
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
if (answer3 != null && parseInt(answer3) != null) {
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
 }
}))
}
if (command ==  "3?") {
  if (message.channel.id !== channelID1) return;
  answer3Count+=1;
  
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
if (answer3 != null && parseInt(answer3) != null) {
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
 }
}))
}

//TESTING SERVER END

*/
//START ALL SERVERS

if(command == "gotrivia.set1") {
  if(!message.member.roles.has("474516678617595914")) {
    message.reply("You need `grand` to use this!");
       }

       else {
  const oneMessage = args.join(" ");

  fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer3 => {
    if (answer3 != null && parseInt(answer3) != null) {
    fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(oneMessage ))
    }
     else {
     fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
     }
    }))
    message.channel.send("Answer 1 Count set to: " + oneMessage)
  }
}

if(command == "gotrivia.set2") {
  if(!message.member.roles.has("474516678617595914")) {
    message.reply("You need `grand` to use this!");
       }
       else {
  const twoMessage = args.join(" ");

  fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
    if (answer2 != null && parseInt(answer2) != null) {
    fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer2').set(twoMessage ))
    }
     else {
     fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
     }
    }))
    message.channel.send("Answer 2 Count set to: " + twoMessage)
  }
}

if(command == "gotrivia.set3") {
  if(!message.member.roles.has("474516678617595914")) {
    message.reply("You need `grand` to use this!");
       }
       else {
  const threeMessage = args.join(" ");

  fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
    if (answer3 != null && parseInt(answer3) != null) {
    fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(threeMessage ))
    }
     else {
     fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
     }
    }))
    message.channel.send("Answer 3 Count set to: " + threeMessage)
  }
}

if(command == "gotrivia.setlive") {
  if(!message.member.roles.has("474516678617595914")) {
    message.reply("You need `grand` to use this!");
       }
       else {
  const liveMessage = args.join(" ");

  fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').once('value').then(answer3 => {
    if (answer3 != null && parseInt(answer3) != null) {
    fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set(liveMessage ))
    }
     else {
     fb.database().ref().child('gotrivia').child('gamelive').update(fb.database().ref().child('gotrivia').child('gamelive').set(0))
     }
    }))
    message.channel.send("Live message status set to: " + liveMessage)
  }
}

if(command == "gotrivia.fish") {
  if(!message.member.roles.has("474516678617595914")) {
    message.reply("You need `grand` to use this!");
       }
       else {
message.channel.send("Fishing... Give the fish a sec")
message.channel.send("Answer 1 Points: " + answer1Count)
message.channel.send("Answer 2 Points: " + answer2Count)
message.channel.send("Answer 3 Points: " + answer3Count)
       }

}

if(command == "gotrivia.serverlist") {
  message.channel.send("Coming soon, for now have a coookie => :cookie: ")
}


if(command == "gotrivia.rq") {
  if(!message.member.roles.has("477536243870203904")) {
    message.reply("You need `q resetter` to use this!");
       }
       else {

     answer1Count = 0;
     answer2Count = 0;
     answer3Count = 0;

    //answer 3
    fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
      if (answer3 != null && parseInt(answer3) != null) {
      fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
      }
       else {
       fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
       }
      }))

      //answer 2
      fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
        if (answer2 != null && parseInt(answer2) != null) {
        fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
        }
         else {
         fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
         }
        }))

        //answer 1

        fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer3 => {
          if (answer3 != null && parseInt(answer3) != null) {
          fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
          }
           else {
           fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
           }
          }))

          message.channel.send("Success! All answers set to `0`!")
        }
}


  if (command == "1") {
    if (message.channel.id !== channelIDTK)  {
      if (message.channel.id !== channelIDTTU) 
      if (message.channel.id !== channelIDTZ) return;
      }
    answer1Count+=3;
    
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer1 => {
  if (answer1 != null && parseInt(answer1) != null) {
  fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
  }
   else {
   fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
   }
}))
}
if (command == "1?") {

  if (message.channel.id !== channelIDTK)  {
    if (message.channel.id !== channelIDTTU) 
    if (message.channel.id !== channelIDTZ) return;
    }
  answer1Count+=2;
  
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer1 => {
if (answer1 != null && parseInt(answer1) != null) {
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
 }
}))

}




  if (command ==  "2") {
    if (message.channel.id !== channelIDTK)  {
      if (message.channel.id !== channelIDTTU) 
      if (message.channel.id !== channelIDTZ) return;
      }
    answer2Count+=3;
    
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
  if (answer2 != null && parseInt(answer2) != null) {
  fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
  }
   else {
   fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
   }
}))


}

if (command ==  "2?") {
  if (message.channel.id !== channelIDTK)  {
    if (message.channel.id !== channelIDTTU) 
    if (message.channel.id !== channelIDTZ) return;
    }
  answer2Count+=2;
  
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
if (answer2 != null && parseInt(answer2) != null) {
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
 }
}))

}
if (command ==  "3") {
  if (message.channel.id !== channelIDTK)  {
    if (message.channel.id !== channelIDTTU) 
    if (message.channel.id !== channelIDTZ) return;
    }
  answer3Count+=3;
  
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
if (answer3 != null && parseInt(answer3) != null) {
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
 }
}))

}
if (command ==  "3?") {
 // if (message.channel.id !== channelIDTK || message.channel.id !== channelIDTTU ) return;

 if (message.channel.id !== channelIDTK)  {
  if (message.channel.id !== channelIDTTU) 
  if (message.channel.id !== channelIDTZ) return;
  }

  answer3Count+=2;

  
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
if (answer3 != null && parseInt(answer3) != null) {
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
 }
}))

}




  //END 


  /*

  if (command == "ttu1") {
    if (message.channel.id !== channelIDTTU) return;
    answer1Count+=3;
    
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer1 => {
  if (answer1 != null && parseInt(answer1) != null) {
  fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
  }
   else {
   fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
   }
}))
}
if (command == "ttu1?") {
  if (message.channel.id !== channelIDTTU) return;
  answer1Count+=2;
  
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').once('value').then(answer1 => {
if (answer1 != null && parseInt(answer1) != null) {
fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set("answer1 score => " + answer1Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer1').update(fb.database().ref().child('gotrivia').child('answer1').set(0))
 }
}))
}




  if (command ==  "ttu2") {
    if (message.channel.id !== channelIDTTU) return;
    answer2Count+=3;
    
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
  if (answer2 != null && parseInt(answer2) != null) {
  fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
  }
   else {
   fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
   }
}))
}

if (command ==  "ttu2?") {
  if (message.channel.id !== channelIDTTU) return;
  answer2Count+=2;
  
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').once('value').then(answer2 => {
if (answer2 != null && parseInt(answer2) != null) {
fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set("answer2 score => " + answer2Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer2').update(fb.database().ref().child('gotrivia').child('answer2').set(0))
 }
}))
}
if (command ==  "ttu3") {
  if (message.channel.id !== channelIDTTU) return;
  answer3Count+=3;
  
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
if (answer3 != null && parseInt(answer3) != null) {
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
 }
}))
}
if (command ==  "ttu3?") {
  if (message.channel.id !== channelIDTTU) return;
  answer3Count+=2;
  
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').once('value').then(answer3 => {
if (answer3 != null && parseInt(answer3) != null) {
fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set("answer3 score => " + answer3Count ))
}
 else {
 fb.database().ref().child('gotrivia').child('answer3').update(fb.database().ref().child('gotrivia').child('answer3').set(0))
 }
}))
}
*/

});

client.login(config.token);
