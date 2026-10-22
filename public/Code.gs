/**
 * ============================================================================
 * 10-DAY GENERAL KNOWLEDGE & SOP QUIZ CHALLENGE - GOOGLE APPS SCRIPT WEB APP
 * ============================================================================
 * 
 * HARDCODED SPREADSHEET IDs:
 * 1. User_Scores_DB: "1Wa7g6PVvPrUgHFZSLEOm3ChVEKnKDF9Qqc8V4Nrm5V4"
 * 2. GEN_QUIZ:       "1H6K9jTBY6pSBt9EBjUVaTIjGifQMmqxlA9GWpCXtWqA" (Tabs Day1..Day10)
 * 
 * TIE-BREAKER RULE:
 * When two staff members have equal total points, the staff with lower cumulative
 * completion time (Total_Time_Seconds) ranks higher on the podium and leaderboard.
 */

var USER_SCORES_SPREADSHEET_ID = "1Wa7g6PVvPrUgHFZSLEOm3ChVEKnKDF9Qqc8V4Nrm5V4";
var QUIZ_BANK_SPREADSHEET_ID = "1H6K9jTBY6pSBt9EBjUVaTIjGifQMmqxlA9GWpCXtWqA";

var USER_SCORES_TAB_NAME = "User_Scores_DB";

var TEAMS = [
  "Railway Champions",
  "Metro Riders",
  "Track Masters",
  "Express Line",
  "High-Speed Flyers",
  "Signal Pioneers",
  "Velocity Transit",
  "Depot Dynamos",
  "Rail Pilots",
  "Rapid Transit Titans"
];

function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Access the hardcoded User_Scores_DB spreadsheet
 */
function getUserScoresSheet() {
  try {
    var ss = SpreadsheetApp.openById(USER_SCORES_SPREADSHEET_ID);
    var sheet = ss.getSheetByName(USER_SCORES_TAB_NAME) || ss.getSheets()[0];
    return sheet;
  } catch (e) {
    // If running in container-bound script mode fallback to active
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USER_SCORES_TAB_NAME);
  }
}

/**
 * Access the hardcoded GEN_QUIZ spreadsheet
 */
function getQuizBankSpreadsheet() {
  try {
    return SpreadsheetApp.openById(QUIZ_BANK_SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * HTTP GET HANDLER
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action;

    // 1. If called as API endpoint with ?action=..., return JSON
    if (action) {
      if (action === "ping") {
        return createJsonResponse({
          status: "success",
          message: "Google Apps Script connected to hardcoded sheets.",
          userScoresSheetId: USER_SCORES_SPREADSHEET_ID,
          quizBankSheetId: QUIZ_BANK_SPREADSHEET_ID,
          timestamp: new Date().toISOString()
        });
      }

      if (action === "getLeaderboardData") {
        var data = getLeaderboardData();
        return createJsonResponse({ status: "success", data: data });
      }

      if (action === "getDailyQuestions") {
        var day = parseInt(params.day || "1", 10);
        var questions = getDailyQuestions(day);
        return createJsonResponse({ status: "success", day: day, questions: questions });
      }

      if (action === "getUser") {
        var staffId = params.staffId;
        var user = findUserById(staffId);
        return createJsonResponse({ status: user ? "success" : "not_found", user: user });
      }

      if (action === "initializeSheet") {
        setupCleanSheetHeaders();
        return createJsonResponse({
          status: "success",
          message: "Sheet User_Scores_DB initialized with clean headers and 0 records.",
          timestamp: new Date().toISOString()
        });
      }

      if (action === "deleteUser") {
        var targetStaffId = params.staffId;
        var sheet = getUserScoresSheet();
        if (sheet) {
          var data = sheet.getDataRange().getValues();
          for (var r = 1; r < data.length; r++) {
            if (String(data[r][0]).trim().toLowerCase() === String(targetStaffId).trim().toLowerCase()) {
              sheet.deleteRow(r + 1);
              return createJsonResponse({ status: "success", message: "Deleted staff " + targetStaffId });
            }
          }
        }
        return createJsonResponse({ status: "not_found", message: "Staff not found in sheet." });
      }

      return createJsonResponse({ status: "error", message: "Unknown action: " + action });
    }

    // 2. Default Web App View: Serve the complete standalone frontend HTML page!
    // Creates a zero-setup, direct-access web app URL for all staff
    return HtmlService.createHtmlOutputFromFile("index")
      .setTitle("10-Day Quiz Challenge")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag("viewport", "width=device-width, initial-scale=1");

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * HTTP POST HANDLER
 */
function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var action = payload.action;

    if (action === "initializeSheet") {
      setupCleanSheetHeaders();
      return createJsonResponse({
        status: "success",
        message: "Sheet User_Scores_DB initialized with clean headers and 0 records.",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "deleteUser") {
      var targetStaffId = payload.staffId;
      var sheet = getUserScoresSheet();
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var r = 1; r < data.length; r++) {
          if (String(data[r][0]).trim().toLowerCase() === String(targetStaffId).trim().toLowerCase()) {
            sheet.deleteRow(r + 1);
            return createJsonResponse({ status: "success", message: "Deleted staff " + targetStaffId });
          }
        }
      }
      return createJsonResponse({ status: "not_found", message: "Staff not found in sheet." });
    }

    if (action === "registerUser") {
      var result = registerUser(
        payload.staffId || payload.staff_id,
        payload.staffName || payload.staff_name,
        payload.avatarId || payload.avatar_id
      );
      return createJsonResponse(result);
    }

    if (action === "submitQuizScore") {
      var staffId = payload.staffId || payload.staff_id;
      var day = parseInt(payload.day, 10);
      var score = parseInt(payload.score, 10);
      var correctCount = parseInt(payload.correctCount || 0, 10);
      var timeTakenSeconds = parseInt(payload.timeTakenSeconds || 0, 10);

      var result = submitQuizScore(staffId, day, score, correctCount, timeTakenSeconds);
      return createJsonResponse(result);
    }

    return createJsonResponse({ status: "error", message: "Unknown action in POST: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * 1. Register User in User_Scores_DB
 */
function registerUser(staffId, staffName, avatarId) {
  if (!staffId || !staffName) {
    return { status: "error", message: "staffId and staffName are required." };
  }

  var sheet = getUserScoresSheet();
  if (!sheet) {
    setupInitialSpreadsheets();
    sheet = getUserScoresSheet();
  }

  var data = sheet.getDataRange().getValues();

  // Check if staff already exists
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(staffId).trim().toLowerCase()) {
      var existingUser = {
        staffId: data[i][0],
        staffName: data[i][1],
        avatarId: data[i][2],
        groupName: data[i][3],
        scores: {},
        totalPoints: Number(data[i][14]) || 0,
        totalTimeSeconds: Number(data[i][16]) || 0,
        lastCompletedDay: Number(data[i][15]) || 0
      };
      for (var d = 1; d <= 10; d++) {
        existingUser.scores["Day" + d] = Number(data[i][3 + d]) || 0;
      }
      return { status: "success", isExisting: true, user: existingUser };
    }
  }

  // Count team distribution to balance groups (max 5 per group)
  var teamCounts = {};
  TEAMS.forEach(function(t) { teamCounts[t] = 0; });

  for (var r = 1; r < data.length; r++) {
    var assigned = data[r][3];
    if (teamCounts[assigned] !== undefined) {
      teamCounts[assigned]++;
    }
  }

  var minCount = 999;
  var candidateTeams = [];
  TEAMS.forEach(function(t) {
    if (teamCounts[t] < minCount) {
      minCount = teamCounts[t];
      candidateTeams = [t];
    } else if (teamCounts[t] === minCount) {
      candidateTeams.push(t);
    }
  });

  var assignedGroup = candidateTeams[Math.floor(Math.random() * candidateTeams.length)];
  var newRowIndex = sheet.getLastRow() + 1;
  var formula = "=SUM(E" + newRowIndex + ":N" + newRowIndex + ")";

  // Columns:
  // A: Staff_ID, B: Staff_Name, C: Avatar_ID, D: Group_Name,
  // E..N: Day1..Day10 scores, O: Total_Points, P: Last_Completed_Day, Q: Total_Time_Seconds
  var newRow = [
    staffId,
    staffName,
    avatarId || "avatar_1",
    assignedGroup,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    formula,
    0,
    0 // Total_Time_Seconds
  ];

  sheet.appendRow(newRow);

  return {
    status: "success",
    isExisting: false,
    user: {
      staffId: staffId,
      staffName: staffName,
      avatarId: avatarId || "avatar_1",
      groupName: assignedGroup,
      scores: {},
      totalPoints: 0,
      totalTimeSeconds: 0,
      lastCompletedDay: 0
    }
  };
}

/**
 * 2. Submit Daily Quiz Score with Speed Timer
 */
function submitQuizScore(staffId, day, score, correctCount, timeTakenSeconds) {
  if (!staffId || !day) {
    return { status: "error", message: "staffId and day are required." };
  }

  var sheet = getUserScoresSheet();
  if (!sheet) {
    return { status: "error", message: "User_Scores_DB sheet not found." };
  }

  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(staffId).trim().toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return { status: "error", message: "Staff ID not registered: " + staffId };
  }

  // Column E is Day 1 (Col 5) -> Day d is Col 4 + d
  var dayCol = 4 + day;
  sheet.getRange(rowIndex, dayCol).setValue(score);

  // Update Last_Completed_Day if this day is higher
  var currentLastDay = Number(sheet.getRange(rowIndex, 16).getValue()) || 0;
  if (day > currentLastDay) {
    sheet.getRange(rowIndex, 16).setValue(day);
  }

  // Update Total_Time_Seconds (Column Q = 17)
  var currentTime = Number(sheet.getRange(rowIndex, 17).getValue()) || 0;
  var updatedTime = currentTime + (timeTakenSeconds || 0);
  sheet.getRange(rowIndex, 17).setValue(updatedTime);

  SpreadsheetApp.flush();
  var updatedTotal = Number(sheet.getRange(rowIndex, 15).getValue()) || 0;

  return {
    status: "success",
    message: "Score logged and locked. No retake permitted.",
    staffId: staffId,
    day: day,
    score: score,
    timeTakenSeconds: timeTakenSeconds,
    totalPoints: updatedTotal,
    totalTimeSeconds: updatedTime,
    leaderboard: getLeaderboardData()
  };
}

/**
 * 3. Retrieve Questions from GEN_QUIZ tab
 */
function getDailyQuestions(day) {
  var ss = getQuizBankSpreadsheet();
  var tabName = "Day" + day;
  var sheet = ss.getSheetByName(tabName);

  var questionsPool = [];

  if (sheet) {
    var rows = sheet.getDataRange().getValues();
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (row[0] && String(row[0]).trim() !== "") {
        questionsPool.push({
          id: "Q" + day + "_" + r,
          question: String(row[0]).trim(),
          options: [
            String(row[1] || "").trim(),
            String(row[2] || "").trim(),
            String(row[3] || "").trim(),
            String(row[4] || "").trim()
          ],
          correctAnswer: String(row[5] || "").trim()
        });
      }
    }
  }

  var shuffled = questionsPool.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled.slice(0, 5);
}

/**
 * 4. Retrieve Leaderboard Data with Tie-Breaker
 */
function getLeaderboardData() {
  var sheet = getUserScoresSheet();
  if (!sheet) {
    return { individuals: [], groups: [], allIndividuals: [] };
  }

  var values = sheet.getDataRange().getValues();
  var individuals = [];
  var groupMap = {};

  TEAMS.forEach(function(team) {
    groupMap[team] = {
      teamName: team,
      aggregatePoints: 0,
      aggregateTimeSeconds: 0,
      memberCount: 0,
      members: []
    };
  });

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var staffId = String(row[0] || "").trim();
    if (!staffId) continue;

    var staffName = String(row[1] || staffId);
    var avatarId = String(row[2] || "avatar_1");
    var groupName = String(row[3] || "Group Alpha");
    var totalPoints = Number(row[14]) || 0;
    var lastDay = Number(row[15]) || 0;
    var totalTimeSeconds = Number(row[16]) || 0;

    var memberObj = {
      staffId: staffId,
      staffName: staffName,
      avatarId: avatarId,
      groupName: groupName,
      totalPoints: totalPoints,
      totalTimeSeconds: totalTimeSeconds,
      lastCompletedDay: lastDay
    };

    individuals.push(memberObj);

    if (!groupMap[groupName]) {
      groupMap[groupName] = { teamName: groupName, aggregatePoints: 0, aggregateTimeSeconds: 0, memberCount: 0, members: [] };
    }
    groupMap[groupName].aggregatePoints += totalPoints;
    groupMap[groupName].aggregateTimeSeconds += totalTimeSeconds;
    groupMap[groupName].memberCount += 1;
    groupMap[groupName].members.push({ name: staffName, points: totalPoints, timeSeconds: totalTimeSeconds });
  }

  // TIE-BREAKER SORT:
  // 1. totalPoints DESCENDING
  // 2. totalTimeSeconds ASCENDING (faster time wins the tie!)
  individuals.sort(function(a, b) {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.totalTimeSeconds - b.totalTimeSeconds;
  });

  individuals.forEach(function(ind, idx) {
    ind.rank = idx + 1;
  });

  var groups = [];
  for (var key in groupMap) {
    groups.push(groupMap[key]);
  }
  groups.sort(function(a, b) {
    if (b.aggregatePoints !== a.aggregatePoints) {
      return b.aggregatePoints - a.aggregatePoints;
    }
    return a.aggregateTimeSeconds - b.aggregateTimeSeconds;
  });

  groups.forEach(function(grp, idx) {
    grp.rank = idx + 1;
  });

  return {
    individuals: individuals, // All 50 staff members ranked
    allIndividuals: individuals,
    groups: groups
  };
}

function findUserById(staffId) {
  var sheet = getUserScoresSheet();
  if (!sheet) return null;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(staffId).trim().toLowerCase()) {
      var user = {
        staffId: data[i][0],
        staffName: data[i][1],
        avatarId: data[i][2],
        groupName: data[i][3],
        scores: {},
        totalPoints: Number(data[i][14]) || 0,
        totalTimeSeconds: Number(data[i][16]) || 0,
        lastCompletedDay: Number(data[i][15]) || 0
      };
      for (var d = 1; d <= 10; d++) {
        user.scores["Day" + d] = Number(data[i][3 + d]) || 0;
      }
      return user;
    }
  }
  return null;
}

/**
 * SETUP FUNCTION: Run once in Apps Script to initialize clean headers in User_Scores_DB
 * Starts completely blank with 0 staff - real drivers will be appended upon registration!
 */
function setupCleanSheetHeaders() {
  var userSs = SpreadsheetApp.openById(USER_SCORES_SPREADSHEET_ID);
  var scoreSheet = userSs.getSheetByName(USER_SCORES_TAB_NAME) || userSs.insertSheet(USER_SCORES_TAB_NAME);
  scoreSheet.clear();

  var headers = [
    "Staff_ID", "Staff_Name", "Avatar_ID", "Group_Name",
    "Day1_Score", "Day2_Score", "Day3_Score", "Day4_Score", "Day5_Score",
    "Day6_Score", "Day7_Score", "Day8_Score", "Day9_Score", "Day10_Score",
    "Total_Points", "Last_Completed_Day", "Total_Time_Seconds"
  ];
  scoreSheet.appendRow(headers);
  scoreSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
  scoreSheet.setFrozenRows(1);

  SpreadsheetApp.flush();
  Logger.log("Clean headers initialized in User_Scores_DB. Ready for real staff registration!");
}

// Deprecated alias for backwards compatibility
function setupInitialSpreadsheets() {
  setupCleanSheetHeaders();
}
