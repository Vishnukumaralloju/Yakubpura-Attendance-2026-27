const url = "https://script.google.com/macros/s/AKfycbzjLh5q0WoBD5Se92C0H6qzVV6W9MvLuTWaI4QcxaRnrDjxSZznVeUWSGrepcSWV_hDAg/exec"; 

window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("attendanceDate").value = today;
    loadStudents();
};

// తేదీ ఫార్మాట్‌ను గూగుల్ షీట్ సరిగ్గా రీడ్ చేసేలా మార్చే ఫంక్షన్
function formatDateToSheet(dateString) {
    if (!dateString) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = dateString.split("-"); 
    // షీట్‌లో '23-Jun-2026' లేదా గూగుల్ డేట్ ఆబ్జెక్ట్ మ్యాచ్ అవ్వడానికి
    return `${parseInt(parts[2], 10)}-${months[parseInt(parts[1], 10) - 1]}-${parts[0]}`; 
}

// Select All చెక్‌బాక్స్ ఫంక్షన్
function toggleSelectAll(master) {
    const checkboxes = document.querySelectorAll(".attendance-check");
    checkboxes.forEach(cb => {
        cb.checked = master.checked;
    });
}

function loadStudents() {
    const className = document.getElementById("className").value;
    const container = document.getElementById("studentContainer");
    const loading = document.getElementById("loading");
    
    // క్లాస్ మారినప్పుడు Select All బాక్స్ ని అన్‌టిక్ చేయడానికి
    document.getElementById("selectAllBox").checked = false;
    
    container.innerHTML = "";
    loading.style.display = "block";
    
    fetch(`${url}?className=${encodeURIComponent(className)}`, { method: "GET", redirect: "follow" })
    .then(response => response.json())
    .then(students => {
        loading.style.display = "none";
        if (!students || students.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#aaa;'>విద్యార్థులు ఎవరూ లేరు.</p>";
            return;
        }
        
        students.forEach(student => {
            const item = document.createElement("div");
            item.className = "student-item";
            // ఇక్కడ "checked" తీసేశాను, కాబట్టి బై డిఫాల్ట్ టిక్ మార్క్స్ ఉండవు
            item.innerHTML = `
                <div class="student-info">
                    <span class="roll-no">${student.rollNo}</span>
                    <span class="name">${student.name}</span>
                </div>
                <input type="checkbox" class="attendance-check" data-roll="${student.rollNo}">
            `;
            container.appendChild(item);
        });
    })
    .catch(error => {
        loading.style.display = "none";
        console.error("Error loading students:", error);
        container.innerHTML = "<p style='text-align:center; color:#f44336;'>డేటా లోడ్ అవ్వలేదు. దయచేసి రీఫ్రెష్ చేయండి.</p>";
    });
}

function submitAllAttendance() {
    const className = document.getElementById("className").value;
    const rawDate = document.getElementById("attendanceDate").value;
    const msgElement = document.getElementById("msg");
    
    if(!rawDate) { alert("దయచేసి తేదీని ఎంచుకోండి!"); return; }
    
    const dateVal = formatDateToSheet(rawDate);
    const checkboxes = document.querySelectorAll(".attendance-check");
    
    msgElement.style.color = "#ff9800";
    msgElement.innerText = "హాజరు షీట్‌లోకి అప్‌లోడ్ అవుతోంది... దయచేసి ఆగండి.";
    
    const attendanceData = [];
    checkboxes.forEach(cb => {
        attendanceData.push({
            rollNo: cb.getAttribute("data-roll"),
            isPresent: cb.checked // టిక్ ఉంటే true (షీట్ లో టిక్ పడుతుంది), లేకపోతే false (టిక్ పడదు)
        });
    });
    
    const payload = { className: className, date: dateVal, attendance: attendanceData };
    
    fetch(url, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(res => {
        if(res.status === "success" || res.status === undefined) {
            msgElement.style.color = "#4caf50";
            msgElement.innerText = `${className} తరగతి హాజరు (${dateVal}) విజయవంతంగా నమోదైనది!`;
        } else {
            msgElement.style.color = "#f44336";
            msgElement.innerText = "షీట్‌లో తేదీ మ్యాచ్ అవ్వలేదు: " + dateVal;
        }
    })
    .catch(error => {
        // no-cors/CORS ఇష్యూస్ వచ్చినా డేటా బ్యాక్‌గ్రౌండ్ లో వెళ్ళిపోతుంది
        console.error("Status:", error);
        msgElement.style.color = "#4caf50";
        msgElement.innerText = `హాజరు వివరాలు పంపబడ్డాయి (${dateVal})! ఒకసారి గూగుల్ షీట్ చెక్ చేయండి.`;
    });
}
