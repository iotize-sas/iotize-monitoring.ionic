import { Component, Input, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BundlePage } from '../../pages/bundle/bundle';
import { ConfigProvider } from '../../iotize-monitoring/globals/config/config';
import { IoTizeProvider } from '../../iotize-monitoring/globals/io-tize/io-tize';

/**
 * Generated class for the IotizeHeaderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'iotize-header',
  templateUrl: 'iotize-header.html'
})
export class IotizeHeaderComponent {
  /**
   * @param {boolean} bundleLinksOn - if true, displays Ionic segment component with all bundles accessible to current user
   * @param {string} selectedBundleId - id of the currently selected bundle
   */
  @Input() bundleLinksOn: boolean;
  @Input() selectedBundleId: string;

  constructor(protected configProvider: ConfigProvider,
    protected ioTizeProvider: IoTizeProvider,
    protected navCtrl: NavController) {
  }
  /**
   * Displays selected bundle
   * @param bundleId 
   */
  moveToBundle(bundleId) {

    this.navCtrl.insert(0, BundlePage, { 'id': bundleId }).then(() => {
      this.navCtrl.popToRoot({
        animate: false
      });
    });
  }
}
