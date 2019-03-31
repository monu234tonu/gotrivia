(function() {

    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyAf4-c9OwQ8lNH1cWaOa3NGbdfuGg_ko0I",
        authDomain: "go-trivia.firebaseapp.com",
        databaseURL: "https://go-trivia.firebaseio.com",
        projectId: "go-trivia",
        storageBucket: "",
        messagingSenderId: "417708866066"
    };
    firebase.initializeApp(config);
    //GAME LIVE
      const preObject = document.getElementById('gamelive');
      const dbRefObject = firebase.database().ref().child('gotrivia').child('gamelive');
      dbRefObject.on('value', snap => console.log(snap.val()));
    dbRefObject.on('value', snap => document.getElementById("gamelive").innerHTML = snap.val());


    //ANSWER 1
    const preObject1 = document.getElementById('answer1');
      const dbRefObject1 = firebase.database().ref().child('gotrivia').child('answer1');
      dbRefObject1.on('value', snap => console.log(snap.val()));
    dbRefObject1.on('value', snap => document.getElementById("answer1").innerHTML = snap.val());

    //ANSWER 2
    const preObject2 = document.getElementById('answer2');
      const dbRefObject2 = firebase.database().ref().child('gotrivia').child('answer2');
      dbRefObject2.on('value', snap => console.log(snap.val()));
    dbRefObject2.on('value', snap => document.getElementById("answer2").innerHTML = snap.val());

    //ANSWER 3
    const preObject3 = document.getElementById('answer3');
    const dbRefObject3 = firebase.database().ref().child('gotrivia').child('answer3');
    dbRefObject3.on('value', snap => console.log(snap.val()));
  dbRefObject3.on('value', snap => document.getElementById("answer3").innerHTML = snap.val());

    
  


  }());
  