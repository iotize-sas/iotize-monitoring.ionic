import { Component } from '@angular/core';
import { IonicPage, ToastController, AlertController, Events } from 'ionic-angular';
import { ConfigProvider } from '../../iotize-monitoring/globals/config/config';
import { IoTizeProvider } from '../../iotize-monitoring/globals/io-tize/io-tize';
import { HttpHeaders } from '@angular/common/http';

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
  protocolName: string = "BLE"; //default value

  constructor(protected configProvider: ConfigProvider,
              private iotizeProvider: IoTizeProvider,
              public toastCtrl: ToastController,
              public alertCtrl: AlertController,
              public events: Events) {
                this.subscribeToComEvents();
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

  // mockConfig() {
  //   this.configProvider.getConfig('assets/xml/Sensor_demo.iotz');
  // }
}
