//-------------------------------ERROR CODES-------------------------------



function makeErrorMessage(err) {
    closeError();
    let div = document.createElement("div");
    div.className = "errorMessage";
    div.onclick = function () { closeError(); };
    div.id = "error";
    let text;
    switch (err) {
        //new team
        case "012":
            text = document.createTextNode("ERROR: ID blank and team must contain at least 2 people");
            break;
        case "01":
            text = document.createTextNode("ERROR: ID Blank");
            break;
        case "02":
            text = document.createTextNode("ERROR: team must contain at least 2 people");
            break;
        //log in
        case "12":
            text = document.createTextNode("ERROR: No username entered");
            break;
        case "13":
            text = document.createTextNode("ERROR: No password entered");
            break;
        case "123":
            text = document.createTextNode("ERROR: No username or password entered");
            break;
        case "00":
            text = document.createTextNode("ERROR: Username or password incorrect");
            break;
        //new player
        case "5":
            text = document.createTextNode("ERROR: One or more fields blank");
            break;
        case "6":
            text = document.createTextNode("ERROR: Fields contain illegal characters");
            break;
        case "56":
            text = document.createTextNode("ERROR: One or more fields blank and fields contain illegal characters");
            break;
        //new game
        case "7":
            text = document.createTextNode("ERROR: You must select exactly 2 teams");
            break;
        case "8":
            text = document.createTextNode("ERROR: Duration must be a number");
            break;
        case "9":
            text = document.createTextNode("ERROR: Duration should be between 10 and 300 minutes");
            break;
        default:
            text = document.createTextNode("Unknown error");
            break;
    }
    div.appendChild(text);
    document.getElementById("body").appendChild(div);
}

function closeError() {
    try {
        document.getElementById("body").removeChild(document.getElementById("error"));
    }
    catch (err) {
        return;
    }
}


//-------------------------------GAME.HTML-------------------------------



var selectedGame = []; //selected teams

//keep track of selected teams
function toggleG(teamId) {
    if (selectedGame.includes(teamId)) {
        selectedGame = selectedGame.filter(function (value, index, arr) {
            if (value == teamId) {
                return;
            }
            return value;
        });
        //set style to deselected
        document.getElementById(teamId).style.color = "white"
        document.getElementById(teamId).style.borderLeft = "15px solid white"
    }
    else {
        //set style to selected
        selectedGame.push(teamId);
        document.getElementById(teamId).style.color = " rgb(255, 217, 0)";
        document.getElementById(teamId).style.borderLeft = "15px solid rgb(255, 217, 0)";
    }
}

function validateGame() {
    if (selectedGame.length !== 2) {
        //if wrong number of games selected, error
        makeErrorMessage("7");
    }
    else if (document.getElementById("inputDuration").isNaN) {
        //duration isn't a number, error
        makeErrorMessage("8");
    }
    else if (document.getElementById("inputDuration").value < 10 || document.getElementById("inputDuration").value > 300) {
        //duration is outside of set range (need to specify range values)
        makeErrorMessage("9");
    }
    else {
        //info is correct
        //display confirmed window
        //probably call writeJSONToServer()
        //first actually edit it lol
    }
}



//-------------------------------TEAM.HTML-------------------------------



var selectedTeam = []; //who did they choose

//open validation window
function goValidate() {
    //did they enter an ID?
    let idEntered = document.getElementById("inputTeamID").value.trim() !== "" ? true : false;
    //console.log(document.getElementById("inputTeamID").value.trim());
    //at least 2 entries in team?
    let teamEntered = selectedTeam.length > 1 ? true : false;
    //if they have all compulsory fields... is there a teamID? have they chosen at least 2 people?
    if (idEntered && teamEntered) {
        document.getElementById("teamID").innerHTML = document.getElementById("inputTeamID").value;
        selectedTeam.forEach(elem => {
            //try catch to avoid adding duplicate items
            try {
                let exists = document.getElementById("confirm" + elem).onclick;
            }
            catch (e) {
                let li = document.createElement("li");
                li.innerHTML = document.getElementById(elem).value;
                li.id = "confirm" + elem;
                document.getElementById("teamMembers").appendChild(li);
                document.getElementById("validateBox").style.display = "block";
            }
        });
    }
    //if they have missed some fields
    else {
        let errCode = "0";
        if (!idEntered) {
            //id blank
            errCode = errCode + "1";
        }
        if (!teamEntered) {
            //team too small
            errCode = errCode + "2";
        }
        makeErrorMessage(errCode);
        clearData();
    }
}

//keep track of selected users
function toggle(userId) {
    if (selectedTeam.includes(userId)) {
        selectedTeam = selectedTeam.filter(function (value, index, arr) {
            if (value == userId) {
                return;
            }
            return value;
        });
        //set style to deselected
        document.getElementById(userId).style.color = "white"
        document.getElementById(userId).style.borderLeft = "15px solid white"
    }
    else {
        //set style to selected
        selectedTeam.push(userId);
        document.getElementById(userId).style.color = " rgb(255, 217, 0)";
        document.getElementById(userId).style.borderLeft = "15px solid rgb(255, 217, 0)";
    }
}

function clearData() {
    selectedTeam.forEach(elem => {
        document.getElementById(elem).style.color = "white"
        document.getElementById(elem).style.borderLeft = "15px solid white"
    });
    //remove the entered text
    document.getElementById("teamID").innerHTML = "";
    document.getElementById("teamMembers").innerHTML = "";
    //empty array
    selectedTeam = [];
    //hide it
    document.getElementById("validateBox").style.display = "none";
}



//-------------------------------PLAYER.HTML-------------------------------




function validatePlayer() {
    //are the fields empty?
    let nameEntered = document.getElementById("inputName").value.trim() !== "" ? true : false;
    let snameEntered = document.getElementById("inputSurname").value.trim() !== "" ? true : false;
    let regex = true;

    if ((nameEntered && snameEntered) && regex) {
        //is correct, display "success" message
        //also db communication here
        //probably call writeJSONToServer()
        //first actually edit it lol
    }
    else {
        let error = "";
        if (!nameEntered || !snameEntered) {
            //error: one or more fields blank
            error = error + "5";
        }
        if (regex) //should be a regex test to check for special characters
        {
            //error: one or more field contains special characters
            error = error + "6";
        }
        makeErrorMessage(error);
    }
}



//-------------------------------INDEX.HTML-------------------------------


//this can get more precise when we have more restrictions
function verifyInputLocally() {
    if (document.getElementById("username").value.trim() == "") {
        if (document.getElementById("password").value.trim() == "") {
            //no username or password
            makeErrorMessage("123");
        }
        //no username, correct password
        makeErrorMessage("12");
    }
    else if (document.getElementById("password").value.trim() == "") {
        //correct username, no password
        makeErrorMessage("13");
    }
    else {
        console.log("all clear");
        login();
        //all correct, proceed with send
    }
    function login() {
        (async () => {
            var login = await testLogin(document.getElementById("username").value, document.getElementById("password").value);
            if (login == true) {
                //login correct, redirecting
                //probably save user/password somewhere (send using async?)
                window.location.href = '/team.html'; //it's redirectng... every single time... and to the wrong page...
            }
            else {
                //login failed
                console.log("if server error, was: " + login);
                makeErrorMessage("00");
            }
        }
        )();

    }
}