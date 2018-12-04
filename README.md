# IoTize Monitoring.ionic 

Monitoring.ionic is a simple demonstration project showing how to use 'Iotize Device API' and 'IoTize Cordova plugins'.

This sample is based on Ionic 3 tabs template. See [Ionic tutorial](https://ionicframework.com/docs/intro/installation/)

## Prerequisites

Your computer needs to be set up for Android, iOS or Windows UWP Cordova development.

- [Android](https://cordova.apache.org/docs/en/8.x/guide/platforms/android/index.html)
- [iOS](https://cordova.apache.org/docs/en/8.x/guide/platforms/ios/index.html)
- [Windows](https://cordova.apache.org/docs/en/8.x/guide/platforms/windows/index.html)

## Usage

Plug in your Tap device. Then build and run the app.

```bash
git clone https://github.com/iotize-sas/monitoring.ionic.git
cd monitoring.ionic
npm i
ionic cordova run <platform> # replace <platform> by ios, android or windows
```

Upon connection, the app downloads the '.cloud' configuration file to display a dynamic UI for monitoring. Make sure to publish your configuration with [IoTize Studio](https://www.iotize.com/pub/doc/iotize/html/Step9Configurethedeploymentsetti.html#Publish)
 
### Navigation

Once started, the app loads on the connect page. Click the BLE start button to scan surroundings BLE devices.

The app then shows a list of reachable devices. Click on the one you want to connect to.

Once the device connected, you may now access to the monitor page.

The monitor page is built with the configuration file the app downloaded. It has a navigation bar on top of the screen, where you can select the bundle you wish to monitor by clicking on its name.

If you are logged in with an account that has writing rights on a bundle, a **wrench icon** appears next to every concerned variable. By clicking on it, a form asks you for the value you want to set the variable to.

On the about page, you can see informations about the currently connected tap.

### Settings and Authentification

On the Connect page, you can see, at the upper right hand corner of the app, a **gear icon**. By clicking it, a form opens, where you can modify the monitoring refresh period.

On the Monitor and About page, when connected to a tap, you can see a **log-in icon** at the same place. When clicked, it opens a form where you can enter your credentials to login to the tap.

You can logout by clicking the **logout icon**.