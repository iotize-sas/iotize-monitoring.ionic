import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Events, LoadingController, Loading } from 'ionic-angular';
import { BleComProvider, DiscoveredDeviceType } from '../ble-com/ble-com';

/**
 * Generated class for the BleSettingsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'ble-settings',
  templateUrl: 'ble-settings.html'
})
export class BleSettingsComponent implements OnInit, OnDestroy {

  private devicesSubscription:Subscription;
  protected isScanning = false;
  public loading: Loading = null;

  devices: Array<DiscoveredDeviceType> = [];

  constructor(public bleComProvider: BleComProvider,
              private changeDetector: ChangeDetectorRef,
              public loadingCtrl: LoadingController,
              public events: Events) {
  }
  ngOnInit() {
    console.log('subscribing to devicesObservable');
    this.devicesSubscription = this.bleComProvider.devicesObservable()
    .subscribe((data) => {
      console.log('device found: ' + data);
      if (this.devices.map((entry) => entry.address).indexOf(data.address) >= 0){
        return;
      }
      this.devices.push(data);
      this.changeDetector.detectChanges();
    },
    (error) => console.error(error));

    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.devicesSubscription.unsubscribe();
    this.unsubscribeEvents();
  }

  startScan(){
    this.devices = this.devices.filter(device => device.address == this.bleComProvider.selectedDevice);
    // this.devices.splice(0, this.devices.length);
    this.bleComProvider.startScan();
    this.isScanning = true;
  }
  
  stopScan(){
    this.bleComProvider.stopScan();
    this.isScanning = false;
    }

  async connect(device: DiscoveredDeviceType) {
    this.stopScan();
    this.loading = this.loadingCtrl.create({
      content: `Connecting to ${device.name}`
    });

    this.loading.present();
    try {
      await this.bleComProvider.onConnect(device.address);
      // await this.iotizeProvider.connectionPromise;
      await this.loading.dismiss();
      this.loading = null;
    } catch (e) {
      console.error("connect failed")
      console.error(e);
      await this.loading.dismiss();
      this.loading = null;
      throw new Error("Connection failed");
    }
    
  }

  async disconnect(device: DiscoveredDeviceType) {
    try {
      await this.bleComProvider.disconnectFrom(device.address);
    } catch (exception) {
      console.error(exception);
    }
  }

  private subscribeEvents() {
    // Trigger change detection on stop scan
    this.events.subscribe('scan:stopped', () => {
      this.changeDetector.detectChanges();
    });

    
    this.events.subscribe('connection:pending', (message) => {
      this.loading.setContent(message);
    });

    
  }

  private unsubscribeEvents() {
    this.events.unsubscribe('scan:stopped');
  }

}
