import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { BLEComProtocol } from '@iotize/cordova-plugin-iotize-ble';
import { IoTizeProvider } from '../../../globals/io-tize/io-tize';
import { Events } from 'ionic-angular';
import { CordovaInterface } from '@iotize/cordova-plugin-iotize-ble';

declare var iotizeBLE: CordovaInterface;

export interface DiscoveredDeviceType{
    name: string;
    address: string;
    rssi?: number;
}

/**
 * This provider gives access to BLE features, such as scanning for devices, or connecting to one.
 * 
 * Output events :
 * <ul>
 *  <li>scan:started</li>
 *  <li>scan:startfailed</li>
 *  <li>scan:stopped</li>
 *  <li>scan:stopfailed</li>
 *  <li>connection:success</li>
 *  <li>connection:failure</li>
 *  <li>disconnection:success</li>
 *  <li>disconnection:failure</li>
 *  <li>ble:available</li>
 *  <li>ble:unavailable</li>
 * </ul>
 */

@Injectable()
export class BleComProvider {

  stringInfo: string;
  selectedItem: any;

  //list of BLE devices
  selectedDevice: string = "";
  public isScanning: boolean = false;
  private devices$: Subject<DiscoveredDeviceType>;

  connection?: BLEComProtocol = null;

  constructor(public iotizeProvider: IoTizeProvider,
              public events: Events) {
    console.log('Hello BleComProvider Provider');
    this.devices$ = new Subject();
  }

  /**
   * Launches the scan for BLE devices
   */

  startScan() {
    
    console.log("Start Scanning ...");

    iotizeBLE.startScan((result) => {
      console.log(result);
      if (result == 'Ok') {
        this.isScanning = true;
        this.publishEvent('scan:started');
        return;
      }
      this.devices$.next(result);
      // this.devices$.next(JSON.parse(result));
    }, (error) => {
      iotizeBLE.getLastError((lasterror) => {
        console.log("startScan error " + lasterror);
      }, (err) => {
        console.error("error ", error);
      });
      this.publishEvent('scan:startfailed', error);
    });
  }

  /**
   * Gets the observable on the devices$ Subject
   * @return {Observable<DiscoveredDeviceType>}
   */

  devicesObservable(): Observable<DiscoveredDeviceType> {
    return this.devices$.asObservable();
  }

  stopScan() {
    console.log("Stop Scanning ...");

    iotizeBLE.stopScan((result) => {
       console.log(result);
       this.isScanning = false;
       this.publishEvent('scan:stopped');
      },
      (error) => 
      {
         console.log("failed : " + error);
         this.publishEvent('scan:stopfailed', error);
        });
  }

  async connectTo(device) {
    try {
      console.log('trying to connect to ' + device);
      await this.iotizeProvider.init(new BLEComProtocol(device));
      console.log('connected!');
      console.log('SN: ' + await this.iotizeProvider.getSerialNumber());
      this.selectedDevice = device;  
      this.events.publish('connection:success');

    } catch (exception) {
      this.events.publish('connection:failure', exception);
      console.error("connection failed, disconnecting...");
      await this.iotizeProvider.disconnect();
      throw new Error("connectTo failed");
    }
  }

  async onConnect(item: string) {

    try {
      if (this.isScanning) {
        this.stopScan();
      }
      if (this.selectedDevice != "") {
        console.log("already connected to: " + this.selectedDevice);
        await this.disconnectFrom(this.selectedDevice);
      }
      
      await this.connectTo(item);

    } catch (error) {
      console.error(error);
      this.iotizeProvider.clear();
      throw new Error("connection failed");
    }

  }
  async disconnectFrom(item: string) {
    try {
      this.stringInfo = "Disconnecting from " + item;
      console.log("Disconnecting from " + item);

      await this.iotizeProvider.device.disconnect();
      
      this.publishEvent('disconnection:success');
    } catch (exception) {
      this.publishEvent('disconnection:failure', exception);
    }
    this.selectedDevice = "";
    this.selectedItem = 0;
    this.iotizeProvider.clear();
  }

  checkAvailable() {
    iotizeBLE.checkAvailable((result) => {
      console.log(result);  
      this.publishEvent('ble:available');
    }, (error) => {
      this.publishEvent('ble:unavailable', error);
    });
  }

  publishEvent(event: string, ...args: any[]) {
    console.log("publishing event " + event);
    this.events.publish(event, args);
  }

  mockDevice() {
    const date = Date.now();
    this.devices$.next({
      address: `test ${date}`,
      name: `test ${date}`
    })
  }
}
