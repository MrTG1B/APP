document.addEventListener("DOMContentLoaded", function() {
    const menuButton = document.getElementById('menuButton');
    const closeButton = document.getElementById('closeButton');
    const overlay = document.getElementById('overlay');
    const topFrame = document.getElementById('topFrame');
    const buttonsContainer = document.getElementById('buttonsContainer');
    const body = document.querySelector('body');
    const buttons = document.querySelectorAll("#buttonsContainer .modeButton");
    const handConnectButton = document.getElementById('handConnect');
    const handIcon = document.getElementById('handIcon');
    const connectText = document.getElementById('connectText');

    let bluetoothDevice = null;
    let characteristic = null;

    const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

    menuButton.addEventListener('click', function() {
        slideFunction(overlay);
    });

    closeButton.addEventListener('click', function() {
        slideFunction(overlay);
    });

    function slideFunction(frame) {
        const isOpen = frame.classList.contains('open');
        frame.classList.toggle('open', !isOpen);
        topFrame.classList.toggle('blur', !isOpen);
        topFrame.classList.toggle('no-scroll', !isOpen);
        buttonsContainer.classList.toggle('blur', !isOpen);
        buttonsContainer.classList.toggle('no-scroll', !isOpen);
        body.classList.toggle('no-scroll', !isOpen);

        buttons.forEach(button => {
            button.disabled = isOpen;
            button.style.pointerEvents = isOpen ? "none" : "auto";
        });
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

        // Get the index of the clicked button from its dataset
        const buttonIndex = event.currentTarget.dataset.index;

        // Send the index to the Bluetooth device
        if (characteristic) {
            sendDataToBluetoothDevice(buttonIndex);
        } else {
            console.log("Bluetooth device not connected.");
        }
    }

    // Assign each button a unique data attribute for index and add event listeners
    buttons.forEach((button, index) => {
        button.dataset.index = index + 1;
        button.addEventListener("click", handleButtonClick);
    });

    async function sendDataToBluetoothDevice(data) {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data.toString());
        try {
            await characteristic.writeValue(encodedData);
            console.log(`Data sent to device: ${data}`);
        } catch (error) {
            console.log(`Failed to send data: ${error}`);
        }
    }

    async function connectBluetoothDevice() {
        try {
            connectText.textContent = "Connecting...";
            bluetoothDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [SERVICE_UUID] }]
            });

            const server = await bluetoothDevice.gatt.connect();
            const service = await server.getPrimaryService(SERVICE_UUID);
            characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

            console.log("Connected to Bluetooth device");
            connectText.textContent = "Connected";
            connectText.style.color = "#008000";
        } catch (error) {
            console.log(`Bluetooth connection failed: ${error}`);
            connectText.textContent = "Disconnected";
            connectText.style.color = "#FF5757";
            handIcon.src = "static/images/disconnected.png";
        }
    }

    handConnectButton.addEventListener('click', connectBluetoothDevice);
});
