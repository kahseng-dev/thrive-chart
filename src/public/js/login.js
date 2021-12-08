import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

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
    }
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "../../index.html"
        }

        else {
            $("#login-form").on("submit", (e) => {
                e.preventDefault()
                let email = $("#login-email").val()
                let password = $("#login-password").val()
                
                signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    $("#login-status").removeClass("text-danger")
                    $("#login-status").addClass("text-success")
                    $("#login-status").text("Successfully Logged In")
                })
                .catch((error) => {
                    $("#login-status").removeClass("text-success")
                    $("#login-status").addClass("text-danger")
    
                    const errorCode = error.code;
                    const errorMessage = error.message;
    
                    switch (errorMessage) {
                        case "Firebase: Error (auth/invalid-email).":
                            $("#login-status").text("Invalid email")
                            break
    
                        case "Firebase: Error (auth/internal-error).":
                            $("#login-status").text("Invalid password or email")
                            break
    
                        case "Firebase: Error (auth/user-not-found).":
                            $("#login-status").text("Account does not exist")
                            break

                        case "Firebase: Error (auth/wrong-password).":
                            $("#login-status").text("Invalid password")
                            break
                            
                        default:
                            $("#login-status").text(errorMessage)
                    }
                })
            })
        }
    })
})
