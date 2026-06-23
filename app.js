const url = "YOUR_APPS_SCRIPT_URL_HERE"; // మీ గూగుల్ వెబ్ యాప్ URL ఇక్కడ పెట్టండి

function submitAttendance() {
    const dateVal = document.getElementById("attendanceDate").value;
    const rollNoVal = document.getElementById("rollNo").value;
    const statusVal = document.getElementById("status").value === "true"; // converts string to boolean
    const msgElement = document.getElementById("msg");
 
    if (!rollNoVal) {
        alert("దయచేసి రోల్ నంబర్ ఎంటర్ చేయండి!");
        return;
    }

    msgElement.innerText = "సబ్మిట్ అవుతోంది... దయచేసి ఆగండి.";

    // గూగుల్ షీట్‌కు పంపించాల్సిన డేటా స్ట్రక్చర్
    const attendanceData = {
        date: dateVal,
        rollNo: rollNoVal,
        isPresent: statusVal
    };

    // fetch API ద్వారా గూగుల్ యాప్స్ స్క్రిప్ట్ కి డేటా పంపడం
    fetch(url, {
        method: "POST",
        mode: "no-cors", // CORS ఎర్రర్స్ రాకుండా ఉండటానికి
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(attendanceData)
    })
    .then(() => {
        msgElement.innerText = `రోల్ నంబర్ ${rollNoVal} అటెండెన్స్ విజయవంతంగా అప్‌డేట్ అయింది!`;
        document.getElementById("rollNo").value = ""; // ఇన్‌పుట్ బాక్స్ క్లియర్ చేయడానికి
    })
    .catch(error => {
        console.error("Error:", error);
        msgElement.innerText = "ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.";
    });
}
