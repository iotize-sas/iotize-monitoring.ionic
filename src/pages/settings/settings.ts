import { Component, ViewChild } from '@angular/core';
import { IonicPage, ToastController, AlertController, Events } from 'ionic-angular';
import { ConfigProvider } from '../../iotize-monitoring/globals/config/config';
import { IoTizeProvider } from '../../iotize-monitoring/globals/io-tize/io-tize';
import { NfcProvider } from '../../iotize-monitoring/globals/nfc/nfc';
import { BleSettingsComponent } from '../../iotize-monitoring/protocols/ble-module/ble-settings/ble-settings';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  @ViewChild('bleSettings') bleComponent: BleSettingsComponent;

  protocolName: string = "BLE"; //default value

  constructor(protected configProvider: ConfigProvider,
              private iotizeProvider: IoTizeProvider,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              public events: Events,
              public nfc: NfcProvider) {
                this.subscribeToComEvents();
                this.subscribeToNFCEvents();
  }

  subscribeToComEvents(){
    this.events.subscribe('connection:success', () => {
      this.showToast('Connected to device');
    });
    this.events.subscribe('connection:failure', (error) => {
      this.showToast(`Connection failed: ${error}`);
      console.error(error);
    });
    this.events.subscribe('disconnection:success', () => {
      this.showToast('Disconnected from device');
    });
    this.events.subscribe('disconnection:failure', (error) => {
      this.showToast('Disconnection failed');
      console.error(error);
    });
  }

  showToast(msg: string, duration?: number){
    console.log(msg);
    const toast = this.toastCtrl.create({
      message: msg,
      duration: duration || 3000
    });
    toast.present();
  }

  openMonitoringConfigAlert(){
    const prompt = this.alertCtrl.create({
      title: "Settings",
      inputs: [
        {
          name: 'period',
          type: 'number',
          placeholder: 'Refresh Period: ' + this.iotizeProvider.getMonitoringConfig().period.toString() + 'ms',
          min: -1
        }
        
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.iotizeProvider.setMonitoringConfig({
              duration: data.duration || this.iotizeProvider.getMonitoringConfig().duration.toString(),
              period: data.period || this.iotizeProvider.getMonitoringConfig().period.toString()
            });
          }
        }
      ]
    });
    prompt.present();
  }

  subscribeToNFCEvents() {
    this.nfc.tagFound.subscribe(tap => {
      if (this.bleComponent.devices.find(device => device.name == tap.name) === undefined) {
        this.bleComponent.devices.push(tap);
      }
      if (this.bleComponent.bleComProvider.selectedDevice === '' || this.bleComponent.loading == null) {
        this.bleComponent.connect(tap);
      }
    });
  }

  // mockConfig() {
  //   this.configProvider.getConfig('assets/xml/Sensor_demo.iotz');
  // }
}
