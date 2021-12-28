import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

function downloadExcel(data, filename) {

    // get headers
    let keys = Object.keys(data[0])
    let headers = []
    keys.map((k) => {
        headers.push({text: k})
    })
    
    // set the first row to be headers in sheet
    let fileData = [headers]
    
    data.map((d) => {
        var row = []
        var array = Object.values(d)

        // for each row of data in json push as object with text into variable row
        array.map((e) => {
            row.push({text: e})
        })
        
        // row will be the data written to excel
        fileData.push(row)
    })

    var excelData = [
        {
            "sheetName": "Sheet1",
            "data": fileData
        }
    ]

    var options = {
        fileName: filename
    }

    Jhxlsx.export(excelData, options)
}

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
    const database = getDatabase(app);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            onValue(ref(database, 'users/' + uid + '/username'), (snapshot) => {
                const data = snapshot.val()
                $("#username").text(data)
                
                $("#download-excel").on("click", () => {
                    onValue(ref(database, 'users/' + user.uid + '/data'), (snapshot) => {
                        const userData = snapshot.val()
                        downloadExcel(userData, `${data} data`)
                    })
                })
            })
        }
    })
})