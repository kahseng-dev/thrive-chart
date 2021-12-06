import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

$(document).ready(() => {
    const firebaseConfig = {
        apiKey: "AIzaSyCeWQCzSS4ZkNO6sjhkxhe1jSMfpzdf_lE",
        authDomain: "thrive-chart.firebaseapp.com",
        databaseURL: "https://thrive-chart-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "thrive-chart",
        storageBucket: "thrive-chart.appspot.com",
        messagingSenderId: "667460322691",
        appId: "1:667460322691:web:866629265a85e6ed6b22b6",
        measurementId: "G-BPWB4MX81R"
    };
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const database = getDatabase(app);

    $("#signup-form").on("submit", (e) => {
        e.preventDefault()
        let username = $("#signup-username").val()
        let email = $("#signup-email").val()
        let password = $("#signup-password").val()
        
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            $("#signup-status").removeClass("text-danger")
            $("#signup-status").addClass("text-success")
            $("#signup-status").text("Successfully Created Account")

            set(ref(database, 'users/' + user.uid), {
                username: username,
                email: email
            })
            .then(() => {
                window.location.href = "./index.html";
            })
        })
        .catch((error) => {
            $("#signup-status").removeClass("text-success")
            $("#signup-status").addClass("text-danger")
            
            const errorCode = error.code;
            const errorMessage = error.message;

            switch (errorMessage) {
                case "Firebase: Error (auth/email-already-in-use).":
                    $("#signup-status").text("Email already in use")
                    break

                case "Firebase: Error (auth/invalid-email).":
                    $("#signup-status").text("Invalid email")
                    break

                case "Firebase: Password should be at least 6 characters (auth/weak-password).":
                    $("#signup-status").text("Password must be a string with at least six characters")
                    break
                    
                default:
                    $("#signup-status").text(errorMessage)
            }
        })
    })
})
