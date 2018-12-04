import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { IoTizeProvider } from '../../iotize-monitoring/globals/io-tize/io-tize';
import { ConfigProvider } from '../../iotize-monitoring/globals/config/config';

/**
 * Generated class for the InformationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-informations',
  templateUrl: 'informations.html',
})
export class InformationsPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              protected iotizeProvider: IoTizeProvider,
              protected configProvider: ConfigProvider,
              public events: Events) {
              }

  ionViewWillEnter() {
    console.log('ionViewDidLoad InformationsPage');
  }
}
