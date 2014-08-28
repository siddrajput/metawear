//var macAddress = "F5:79:E1:06:39:86";


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        disconnectButton.addEventListener('touchstart', bluetooth.disconnect, false);
        connectButton.addEventListener('touchstart', metawearStart, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        metawearStart();
    }
};


//https://github.com/don/cordova-plugin-ble-central
var bluetooth = {
    deviceId : "",
    isNotConnected: function(res) {
        //alert("bluetooth wasn't connected so we'll connect");
        //alert('what is cordova platofrm id: ' + cordova.platformId);
        if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, bluetooth.onDiscoverDevice, bluetooth.onError);
        } else {
            ble.scan([MetaWearServices.serviceUUID], 5, bluetooth.onDiscoverDevice, bluetooh.onError);
        }
    },
    onDiscoverDevice : function(device) {
        console.log("com.lisaseacat" + JSON.stringify(device));
       //alert(JSON.stringify(device));
            if (device.name === "MetaWear") {
                console.log("FOUND METAWEAR" + JSON.stringify(device));
                bluetooth.deviceId = device.id;                
                ble.connect(device.id, bluetooth.onConnect, bluetooth.onError);
            } else {
                console.log('not metawear: ' + device.name);   
            }
    },
     onConnect: function(res) {
        alert('bluetooth connected! ' + JSON.stringify(res));
         connectButton.style.display = "none";
         bluetooth.enableButtonFeedback(bluetooth.subscribeForIncomingData, bluetooth.onError);
         //TODO we want to turn on the LED here
         /*var value = "noidea";
        ble.write(bluetooth.deviceId, MetaWearServices.service_uuid, MetaWearServices.characteristic_uuid, value, bluetooth.onWriteWin, bluetooth.onWriteFail);*/
    },
    onDisconnect: function(err) {
        alert("bluetooth disconnected: " + JSON.stringify(err)); 
        connectButton.style.display = "";
    },
    onError: function(res) {
        alert('Bluetooth generic error handler: ' + JSON.stringify(res));
        
        //if (JSON.stringify(res) === 'Disconnected'){
            bluetooth.onDisconnect(res);
       // }
    },
    onWriteWin: function(res) {
        alert('onWriteWin' + JSON.stringify(res));
    },
    onWriteFail: function(res) {
        alert('onWriteFail' + JSON.stringify(res));
    }, 
    onData: function(buffer) { // data received from MetaWear
        console.log('data received');
        var data = new Uint8Array(buffer);
        console.log('the data is: ' + JSON.stringify(data));
        var message = "";

        if (data[0] === 1 && data[1] === 1) { // module = 1, opscode = 1
            if (data[2] === 1) { // button state
                message = "Button pressed";
            } else {
                message = "Button released";
            }
        }

        alert("MESSAGE FROM ONDATA: " + message);
    },
    onDataError: function(res) {
        alert('Bluetooth Data Error: ' + JSON.stringify(res));
        console.log(JSON.stringify(res));
    },
    writeData: function(buffer, success, failure) { // to to be sent to MetaWear
        console.log('in writeData');
        if (!success) {
            success = function() {
                console.log("success");
                alert( "Sent: " + JSON.stringify(new Uint8Array(buffer)) );
            };
        }

        if (!failure) {
            failure = bluetooth.onError;
        }

        ble.writeCommand(bluetooth.deviceId, metawear.serviceUUID, metawear.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function() {
        console.log('in subscribeForIncomingData. bluetooth serviceUUID is: ' + metawear.serviceUUID);
        ble.notify(bluetooth.deviceId, metawear.serviceUUID, metawear.rxCharacteristic, bluetooth.onData, bluetooth.onDataError);
    },
    enableButtonFeedback: function(success, failure) {
        console.log('in enableButtonFeedback');
        var data = new Uint8Array(6);
        data[0] = 0x01; // mechanical switch
        data[1] = 0x01; // switch state ops code
        data[2] = 0x01; // enable

        bluetooth.writeData(data.buffer, success, failure);
    },
    onMotorButton: function(event) {
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0x80; // Motor
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x00; // Some magic bullshit

        bluetooth.writeData(data.buffer);
    },
    onBuzzerButton: function(event) {
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0xF8; // Buzzer
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x01; // Some magic?

        bluetooth.writeData(data.buffer);
    },
    disconnect: function(event) {
        ble.disconnect(bluetooth.deviceId, bluetooth.onWriteWin, bluetooth.onError);
        bluetooth.deviceId = "";
        
        connectButton.style.display = "";
    },
};

function metawearStart() {
    console.log('metawearStart');
    //bluetoothle.initialize(bluetooth.initializeSuccessCallback, bluetooth.initializeErrorCallback);
    ble.isConnected(bluetooth.deviceId, bluetooth.onConnect, bluetooth.isNotConnected);
    
    
   /* metawear.init(
        // success callback
        function () {
            alert('metawearStart success, now we can use it');
            console.log("metawear init Success");
        },
        // error callback
        function (err) {
            alert('metawear init error' + JSON.stringify(err));
            console.log("bluemix init Error: " + err);
        }, "somethinghere");*/
}















//below is for the bluetoothle plugin in the plugins registry (not Don's)
/*
var bluetooth_2 = {
    initializeSuccessCallback: function() {
        alert('bluetooth initializeSuccessCallback!');
        var params = {"address":macAddress};
        bluetoothle.connect(bluetooth.onConnect, bluetooth.onDisconnect, params);
    },
    initializeErrorCallback: function(err) {
        alert("bluetooth initializeErrorCallback: " + JSON.stringify(err)); 
        //document.getElementById('reconnect').style.display="";
    },
     onConnect: function() {
        alert('bluetooth connected!');
         //Value is a base64 encoded string of bytes to write. Use bluetoothle.getString(bytes) to convert to base64 encoded string from a unit8Array.
         var valAsBytes = bluetoothle.getBytes("\l255,255,255");
         var params = {"value":valAsBytes,"serviceUuid":"180F","characteristicUuid":"2A19"};
        bluetoothle.write(bluetooth.onWriteWin, bluetooth.onWriteFail, params);


    },
    onDisconnect: function(err) {
        alert("bluetooth disconnected: " + JSON.stringify(err)); 
        //document.getElementById('reconnect').style.display="";
    },
    onWriteWin: function(res) {
        alert('onWriteWin' + JSON.stringify(res));
    },
    onWriteFail: function(res) {
        alert('onWriteFail' + JSON.stringify(res));
    }
};*/