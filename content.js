console.log("content script hello")

chrome.runtime.onMessage.addListener(receiveMessage)

function receiveMessage(msg, sender, sendResponse){

    switch(msg.type){
        case "paste_model_version":
            pasteModelVersion(msg) 
            break
        case "check_request":
            checkSerialNumbers()
            break
    }
}

function getSerialInfo(){

    var allElements = document.getElementsByTagName("*")

    infoList = []

    for (var i=0; i < allElements.length; i++) {
        if(allElements[i].nodeName === "FORM"){

            formElement = allElements[i];

            skippedFirstDiv = false

            for(var j=0; j < formElement.children.length; j++){
                if(formElement.children[j].nodeName === "DIV"){
                    
                    if(!skippedFirstDiv){ skippedFirstDiv = true; continue; }

                    divElement = formElement.children[j]

                    infoObject = {}

                    checkMarksObject = {}
                    checkMarkCount = 1

                    serial1Set = false;

                    for(var k=0; k < divElement.children.length; k++){
                        
                        if(divElement.children[k].nodeName === "LABEL"){
                            if(!serial1Set) { infoObject.serial1 = divElement.children[k].textContent }
                            else { infoObject.serial2 = divElement.children[k].textContent }
                            serial1Set = true;
                        }

                        if(divElement.children[k].nodeName === "DIV"){
                            divInDivElement = divElement.children[k];
                            

                            if(divInDivElement.children[0].nodeName === "INPUT"){
                                inputElement = divInDivElement.children[0]

                                switch(inputElement.id){
                                    case "serial": infoObject.serialNumber = inputElement.value; break;
                                    case "model": infoObject.modelNumber = inputElement.value; break;
                                    case "desc": infoObject.description = inputElement.value; break;
                                }
                            }

                            if(divInDivElement.children[0].nodeName === "A"){
                                linkElement = divInDivElement.children[0]
                                
                                svgELement = linkElement.children[0]

                                checkMark = false

                                if(svgELement.getAttribute('data-icon') === "check-circle"){
                                    checkMark = true
                                }

                                switch(checkMarkCount){
                                    case 1: checkMarksObject.scriptingData = checkMark; break;
                                    case 2: checkMarksObject.synergyId = checkMark; break;
                                    case 3: checkMarksObject.intune = checkMark; break;
                                    case 4: checkMarksObject.specifications = checkMark; break;
                                    case 5: checkMarksObject.decommisioned = checkMark; break;        
                                }

                                checkMarkCount++;
                            }    
                        }
                    }

                    infoObject.checkMarks = checkMarksObject
                    infoList.push(infoObject)
                }                
            }
        }
    }

    return infoList
}


function pasteModelVersion(msg){
    var allElements = document.getElementsByTagName("*")

    for (var i=0, max=allElements.length; i < max; i++) {

        if(allElements[i].id === "model"){
            allElements[i].value = msg.txt
        }
    }
}

function checkSerialNumbers(){
    serialInfo = getSerialInfo()
    console.log(serialInfo)
}

function findDuplicateSerialNumbers(serialInfo){

    //var duplicates = [{ serial1s: ["SPB2022-074983","SPB2022-074983"], serialNumber: "xd-2345" }]

    var duplicates = []

    for (var i = 0; i < serialInfo.length-1; i++)
    {
        duplicateObject = { serial1s: [] }

        for (var j = i + 1; j < serialInfo.length; j++)
        {
            if (serialInfo[i].serialNumber === serialInfo[j].serialNumber){
                duplicateObject.serial1s.push(serialInfo[i].serial1)
                duplicateObject.serial1s.push(serialInfo[j].serial1)
                duplicateObject.serialNumber = serialInfo[i].serialNumber
            }
        }

        duplicates.push(duplicateObject)
    }

    return duplicates
}

