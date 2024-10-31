document.addEventListener("DOMContentLoaded", function() {
    const menuButton = document.getElementById('menuButton');
    const closeButton = document.getElementById('closeButton');
    const overlay = document.getElementById('overlay');
    const topFrame = document.getElementById('topFrame');
    const buttonsContainer = document.getElementById('buttonsContainer');
    const body = document.querySelector('body');
    const buttons = document.querySelectorAll("#buttonsContainer .modeButton");
    const handConnectButton = document.getElementById('handConnect'); // Bluetooth connection button
    const handIcon= document.getElementById('handIcon');
    const connectText= document.getElementById('connectText');

    let bluetoothDevice = null;
    let characteristic = null;

    // Correct UUIDs for HM-10
    const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';  // Lowercase
    const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';  // Lowercase

    // Slide overlay function
    menuButton.addEventListener('click', function() {
        slideFunction(overlay);
    });

    closeButton.addEventListener('click', function() {
        slideFunction(overlay);
    });

    function slideFunction(frame) {
        if (frame.classList.contains('open')) {
            frame.classList.remove('open');
            topFrame.classList.remove('blur');
            topFrame.classList.remove('no-scroll');
            buttonsContainer.classList.remove('blur');
            buttonsContainer.classList.remove('no-scroll');
            body.classList.remove('no-scroll');

            buttons.forEach(button => {
                button.disabled = false;
                button.style.pointerEvents = "auto";
            });

        } else {
            frame.classList.add('open');
            topFrame.classList.add('blur');
            topFrame.classList.add('no-scroll');
            buttonsContainer.classList.add('blur');
            buttonsContainer.classList.add('no-scroll');
            body.classList.add('no-scroll');

            buttons.forEach(button => {
                button.disabled = true;
                button.style.pointerEvents = "none";
            });
        }
    }

    document.addEventListener('click', function(event) {
        if (overlay.classList.contains('open') && !overlay.contains(event.target) && !menuButton.contains(event.target)) {
            slideFunction(overlay);
        }
    });

    overlay.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    function handleButtonClick(event) {
        event.stopPropagation();

        // Reset styling for all buttons
        buttons.forEach(button => {
            button.style.borderColor = "";
            button.style.boxShadow = "";
            button.style.width = "";
            button.style.height = "";
        });

        // Add styling to the clicked button
        event.currentTarget.style.borderColor = "#FF5757";
        event.currentTarget.style.boxShadow = "0 0 10px #FF5757";
        event.currentTarget.style.width = "200px";
        event.currentTarget.style.height = "200px";

        // Get the index of the clicked button (starting from 1)
        const buttonIndex = event.currentTarget.dataset.index;
        console.log(buttonIndex.toString());

        // Send the index to the Bluetooth device
        if (characteristic) {
            sendDataToBluetoothDevice(buttonIndex);
        } else {
            console.log("Bluetooth device not connected.");
        }
    }

    // Add event listeners for all buttons inside buttonsContainer
    buttons.forEach((button, index) => {
        button.dataset.index = index + 1;
        button.addEventListener("click", handleButtonClick);
    });

    // Function to send data to Bluetooth device
    async function sendDataToBluetoothDevice(data) {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data.toString()); // Convert to byte format
        try {
            await characteristic.writeValue(encodedData);
            console.log(`Data sent to device: ${data}`);
        } catch (error) {
            console.log(`Failed to send data: ${error}`);
        }
    }

    // Function to handle Bluetooth device connection
    async function connectBluetoothDevice() {
        try {
            // Set the button to "Connecting..." and update color to gray
            connectText.textContent = "Connecting...";
            // connectText.style.color = "#808080";
            // updateHandConnectButton('Connecting...', '#808080');

            // Request the device with the correct service UUID
            bluetoothDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [SERVICE_UUID] }]
            });

            const server = await bluetoothDevice.gatt.connect();
            const service = await server.getPrimaryService(SERVICE_UUID);
            characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

            console.log("Connected to Bluetooth device");

            // Update the button to "Connected" in green
            // updateHandConnectButton('Connected', 'green');
            connectText.textContent = "Connected";
            connectText.style.color = "#008000";
            handIcon.src = "static/images/connected.png";  // Update icon to "connected"

        } catch (error) {
            console.log(`Bluetooth connection failed: ${error}`);

            // Update the button to "Disconnected" in red if connection fails
            // updateHandConnectButton('Disconnected', 'red');
            connectText.textContent = "Disconnected";
            connectText.style.color = "#FF5757";
            handIcon.src = "static/images/disconnected.png";  // Update icon to "disconnected"
            // handIcon.src = "static/images/disconnected.png";  // Update icon to "disconnected"
        }
    }

    // Attach Bluetooth connect function to handConnect button
    handConnectButton.addEventListener('click', connectBluetoothDevice);

    // Set initial state to "Connect" if the device is not connected
    // updateHandConnectButton('Connect', '#000000');  // Default to black text when not connected

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/static/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                }).catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
    
});
