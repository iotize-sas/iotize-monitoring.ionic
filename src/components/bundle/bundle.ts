import { Component, Input } from '@angular/core';
import { Bundle } from '../../iotize-monitoring/classes/bundle';

/**
 * Generated class for the BundleComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bundle',
  templateUrl: 'bundle.html'
})
export class BundleComponent {
  /**
   * @param {Bundle} bundle - IoTize bundle to display
   * @param {boolean} canUpdate - passed to Variable children components
   */
  @Input() bundle: Bundle;
  @Input() canUpdate: boolean;
  constructor() {
  }

}
