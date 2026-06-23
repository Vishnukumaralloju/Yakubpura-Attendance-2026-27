function doGet(e) {
  var sheetName = e.parameter.className || "BiPC II";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  // 5వ రో నుండి 34వ రో వరకు ఉన్న రోల్ నంబర్ మరియు విద్యార్థుల పేర్లను రీడ్ చేయడం
  var data = sheet.getRange(5, 1, 30, 2).getValues(); 
  
  var students = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][1]) { // పేరు ఖాళీగా లేకపోతే
      students.push({
        rollNo: data[i][0],
        name: data[i][1]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(students))
                       .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheetObj = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  
  var sheetName = data.className; 
  var sheet = sheetObj.getSheetByName(sheetName);
  var dateStr = data.date; 
  var attendanceList = data.attendance; // [{rollNo: 1, isPresent: true}, ...]
  
  // 2వ రో లో ఉన్న తేదీలను వెతకడం
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var dateColumnIndex = headers.indexOf(dateStr) + 1;
  
  if (dateColumnIndex > 0) {
    attendanceList.forEach(function(student) {
      var row = parseInt(student.rollNo) + 4; // రోల్ నంబర్ 1 కి 5వ రో వస్తుంది
      sheet.getRange(row, dateColumnIndex).setValue(student.isPresent);
    });
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "తేదీ కనుగొనబడలేదు!"}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
