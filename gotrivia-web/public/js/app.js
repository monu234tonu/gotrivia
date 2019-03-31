(function() {

  // Initialize Firebase
  const config = {
        apiKey: "AIzaSyBY0gv6DJ85zxgpGlvwvitVoeeIQ0qnXPQ",
        authDomain: "personal-website-e0a07.firebaseapp.com",
        databaseURL: "https://personal-website-e0a07.firebaseio.com",
        projectId: "personal-website-e0a07",
        storageBucket: "personal-website-e0a07.appspot.com",
        messagingSenderId: "227472885591"
  };
  firebase.initializeApp(config);
  const preObject = document.getElementById('islive');
  const dbRefObject = firebase.database().ref().child('islive').child('data');
  dbRefObject.on('value', snap => console.log(snap.val()));
  dbRefObject.on('value', snap => document.getElementById("islive").innerHTML = snap.val());

}());
