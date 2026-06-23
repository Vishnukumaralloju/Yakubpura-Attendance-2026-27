// మీ గూగుల్ వెబ్ యాప్ URL ని కింద ఉన్న కోట్స్ మధ్యలో పెట్టండి
const url = "https://script.google.com/macros/s/AKfycbz4-7bYrdV3N6FBWjh-H23gr437IVeoI11jx3hem_K7xNy8EZRHvHhZr0vhGFE-wcaBtQ/exec"; 

function submitAttendance() {
    const dateVal = document.getElementById("attendanceDate").value.trim();
    const rollNoVal = document.getElementById("rollNo").value.trim();
    const statusVal = document.getElementById("status").value === "true";
    const msgElement = document.getElementById("msg");

    if (!rollNoVal) {
        msgElement.style.color = "#ff9800";
        msgElement.innerText = "దయచేసి రోల్ నంబర్ ఎంటర్ చేయండి!";
        return;
    }

    msgElement.style.color = "#2196f3";
    msgElement.innerText = "డేటా షీట్‌కు పంపబడుతోంది... దయచేసి ఆగండి.";

    const attendanceData = {
        date: dateVal,
        rollNo: rollNoVal,
        isPresent: statusVal
    };

    fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(attendanceData)
    })
    .then(() => {
        msgElement.style.color = "#4caf50";
        msgElement.innerText = `రోల్ నంబర్ ${rollNoVal} హాజరు విజయవంతంగా నమోదైనది!`;
        document.getElementById("rollNo").value = ""; // బాక్స్ క్లియర్ చేయడానికి
    })
    .catch(error => {
        console.error("Error:", error);
        msgElement.style.color = "#f44336";
        msgElement.innerText = "కనెక్ట్ అవ్వడంలో సమస్య వచ్చింది. మళ్ళీ ప్రయత్నించండి.";
    });
}
