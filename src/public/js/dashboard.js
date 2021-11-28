$(document).ready(function() {
    $("#upload-button").on("click", () => {
        $("#real-upload-button").click()
    })
    
    $("#real-upload-button").on("change", () => {
        XLSX.read($("#real-upload-button").files[0])
        .then((data) => {
            console.log(data)
        })
    })
})
