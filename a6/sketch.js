// This sketch uses p5.serialport to communicate with an Arduino. It controls what happends when the joystick is moved and button is pressed, as well as the 
// LED brightness based on mouse position. 

const BAUD_RATE = 9600; // Serial baud rate
let port; //global varaible for serial port
let connectBtn; //golbal variable for connect button

//recieving joystick values from Arduino
let joyX = 512; // X axis (0–1023)
let joyY = 512; // Y axis (0–1023)
let joyButton = 1; //default is 1 - not pressed
let ledBrightness = 0; //default LED brightness to send back to ardunio

function setup() {
  createCanvas(windowWidth, windowHeight); //creating the canvas the size of the window
  setupSerial(); //start serial setup
  textAlign(CENTER, CENTER); //direcitons text is centered
  textSize(20); //directions text size
}

function draw() {
  //In case the port is not open
  const portIsOpen = checkPort();
  if (!portIsOpen) {
    return;
  }

  let line = port.readUntil("\n"); //reading one line in the form of xvalue,yvalue,buttonvalue

  if (line.length > 0) { //making sure line is not empty
    line = line.trim(); // removing whitespace/newline characters
    let parts = line.split(","); // splitting the line into parts based on commas
    
    if (parts.length === 3) { //making sure we have three values
      joyX = int(parts[0]); //integer for x value
      joyY = int(parts[1]); //integer for y value
      joyButton = int(parts[2]); //integer for button value
    }
  }

  // Because of the joystick orientation, i mapped the joyY to left/right and joyX for up/down for screen coordinates
    let xPos = map(joyY, 0, 1023, 0, width);
    let yPos = map(joyX, 0, 1023, height, 0); 

  //color of background (light purple or dark purple) based on button press
  if (joyButton === 0) {
    background(80, 0, 120); //dark purple when pressed
  } else {
    background(200, 170, 255); //light purple when not pressed
  }

  //drawing the shape to move with joystick
  noStroke(); //remove stroke
  fill(255, 215, 0); //color gold (tried to do uw colors here :)
  square(xPos - 40, yPos - 40, 80); //drawing square centered at joystick position with size 80

  // Draw text values for coordinates, button state, and led brightness to display at the top
  fill(0);
  text(
    "X: " + joyX + //x state
    "   Y: " + joyY + //y state
    "   Button: " + joyButton + //button state
    "   LED: " + ledBrightness, //led brightness state
    width / 2, 30
  );

  //directions text at the bottom
  text("Move joystick to move the square", width / 2, height - 60);
  text("Move mouse left/right to change LED brightness", width / 2, height - 35);
  text("Press joystick button to change background", width / 2, height - 10);
}

//Three helper functions taken from example code for serial communication

 //Function opens port and creates connect button
function setupSerial() {
  port = createSerial();
  // Try to connect and ports we have used already
  const usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], BAUD_RATE);
  }
  // Create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(10, 10);
  connectBtn.mousePressed(onConnectButtonClicked);
}

//Function opens port and creates connect button
function checkPort() {
  if (!port.opened()) {
    // if port is not opend, change button text and show directions
    text("Click 'Connect to Arduino' to start", width / 2, height / 2);
    connectBtn.html("Connect to Arduino");
    //return a gray background
    background("gray");
    return false;
  } else {
    // connected
    connectBtn.html("Disconnect");
    return true;
  }
}
//Function runs when conncet button is clicked
function onConnectButtonClicked() {
  if (!port.opened()) {
    port.open(BAUD_RATE); //open port if closed
  } else {
    port.close(); //close port if open
  }
}

// Sending LED brightness to Arduino based on mouse movement
function mouseMoved() {
  if (!port || !port.opened()) { //check if port is open and do nothing if it is not
    return;
  }
  ledBrightness = int(map(mouseX, 0, width, 0, 255));  // Map mouseX to LEDbrightness (0–255)
  port.write(ledBrightness + "\n"); // Send brightness as a line of text to Arduino
}

