import { Component } from '@angular/core';
import { IonicPage, NavParams, Events } from 'ionic-angular';
import { Bundle } from '../../iotize-monitoring/classes/bundle';
import { ConfigProvider } from '../../iotize-monitoring/globals/config/config';
import { IoTizeProvider } from '../../iotize-monitoring/globals/io-tize/io-tize';

/**
 * Generated class for the BundlePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bundle',
  templateUrl: 'bundle.html',
})
export class BundlePage {
  bundle: Bundle;
  canUpdate: boolean;

  constructor(public navParams: NavParams,
              private configProvider: ConfigProvider,
              private ioTizeProvider: IoTizeProvider,
              public events: Events) {
  }

  ionViewDidLoad() {
    const bundleId = this.navParams.data['id'] ? +this.navParams.data['id']: 0;
    this.canUpdate = false;
    this.bundle = this.configProvider.getBundleById(bundleId);
    console.log('view did load, with bundleId: ' + bundleId);
    this.events.subscribe('connection:success', () => {
      this.canUpdate = false;
      this.bundle = this.configProvider.getBundleById(0);
    });
  }
  
  ionViewDidEnter() {
    console.log('view did enter');
    try {
      this.refreshcanUpdate();
      this.ioTizeProvider.monitorVariablesFromBundle(this.bundle);
      this.events.subscribe("user:changed", this.refreshcanUpdate.bind(this));
    } catch (e) {
      console.error('failed to monitor :' + e);
    }
  }

  ionViewWillLeave() {
    try {
      console.log('ionViewWillLeave: leaving bundle view, stopping all monitoring');
      this.ioTizeProvider.stopAllMonitoring();
      console.log("ionViewWillLeave: all monitoring should be stopped");
      this.events.unsubscribe('user:changed');
    } catch (error) {
      console.error(error);
    }
  }
  
  refreshcanUpdate(){
    this.canUpdate = this.configProvider.profileCanUpdate(
      (this.ioTizeProvider.currentUser),
       this.bundle.id,);
  }
}
