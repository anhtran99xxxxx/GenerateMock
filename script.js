const headerStr = "    Package package;<br/>    int value[128] = {0};<br/>    package.timeDelay = DELAY_FRAME_MIN;<br/><br/>"
const endStr = "    addToQueue(package);<br/>"
const mainRegex = /.*Content.*:\s(\d+)[\s:<>-\w]+ControlId:\s(\w+)[\s,\w:]+PageId:\s(\w+),\seventType[\s=]+(\w+)[\s,\w:]+EventId:\s([\w\s]+)[\s,\w:]+value[\]\[\(\)\d\w\s]+=\s([-\d]+).*/g
const dataRegex = /value.*/g
const timeRegex = /Content.*:\s(\d+)/g
    
function generateCode() {
    let inputText = document.getElementById("inputValue").value;
    let output = ""
    output += headerStr
    let lastTime = 0
    let currentTime = 0

    let lines = inputText.split("\n")
    var isHasData = false
    lines.forEach(line => {
        if (line.includes('getHmiToMeData - ControlId') == true) {
            let isInvalid = line.search(mainRegex)
            if (isInvalid != -1) {
                isHasData = true

                currentTime = parseInt(line.match(timeRegex)[0].replace(timeRegex, "$1"))
                
                if (lastTime == 0) {
                    lastTime = currentTime
                } else {
                    let diff = currentTime - lastTime
                    lastTime = currentTime
                    if (diff != 0) {
                        output = output + "    package.timeDelay += " + diff + ";<br/>"
                    }
                }

                if (line.includes('ME_SHOW_PAGE') == true) {
                    output = output + "<br/>" + line.replace(mainRegex, '    package.data = PropertyData(ME_SHOW_PAGE, $2, $3, 0, 0);<br/>') + endStr
                }
                else if (line.includes('ME_CLOSE_PAGE') == true) {
                    output +=  line.replace(mainRegex, '    package.data = PropertyData(ME_CLOSE_PAGE, $2, $3, 0, 0);<br/>') + endStr
                }
                else if ((line.includes('ME_UPDATE_INT_ARRAY') == true) || (line.includes('ME_UPDATE_STRING') == true)) {
                    let outData = line.match(dataRegex)[0].replace(/,/, ';') + ';<br/>'
                    output = output + "    " + outData
                    output += line.replace(mainRegex, '    package.data = PropertyData(ME_UPDATE_INT_ARRAY, $2, $3, $5, value, 128);<br/>') + endStr
                }
                else if (line.includes('ME_UPDATE_INT') == true) {
                    output += line.replace(mainRegex, '    package.data = PropertyData(ME_UPDATE_INT, $2, $3, $5, $6, 0);<br/>') + endStr
                }
                else if (line.includes('ME_EVENT_UPDATE') == true) {
                    output += line.replace(mainRegex, '    package.data = PropertyData(ME_EVENT_UPDATE, $2, $3, $5, 0, 0);<br/>') + endStr
                }
            }
            
        } 
    });
    if (isHasData == true) {
        document.getElementById("outputValue").innerHTML = "<pre>" + output +  "</pre>";
    } else {
        document.getElementById("outputValue").innerHTML = "<pre>" + "    Cannot convert, data is invalid" + "</pre>"
    }
    
}

function addTimeDelay(line) {

}
function refreshData() {
    document.getElementById("inputValue").value = "";
    document.getElementById("outputValue").innerHTML = "";
}

function copyToClipboard() {
    var copyText = document.getElementById("outputValue");
    navigator.clipboard.writeText(copyText.innerText).then(function() {
        alert("Copied success");
      }, function(err) {
        alert("Copied error");
      });
}
