import { Component, Input } from '@angular/core';
import { Variable } from '../../iotize-monitoring/classes/variable';
import { AlertController } from 'ionic-angular';
import { IoTizeProvider } from '../../iotize-monitoring/globals/io-tize/io-tize';

/**
 * Generated class for the VariableComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'variable',
  templateUrl: 'variable.html'
})
export class VariableComponent {
  /**
   * @param {Variable} variable - IoTize variable to be displayed.
   * @param {boolean} canUpdate - If true and given variable is updatable, displays and enables variable write feature.
   * /!\ This does not bypass device's built-in security checks
   */
  @Input() variable: Variable;
  @Input() canUpdate: boolean;

  constructor(public alertCtrl: AlertController,
              public ioTizeProvider: IoTizeProvider) {
  }

  showPrompt(){
    if (this.variable.updatable && this.canUpdate) {
      console.log('call on function openAlert');
      this.openAlert();
    }
  }
  /**
   * creates and displays an alert with a form, which is configured for current variable type / size, preventing the user to send an out of bounds value
   */
  openAlert(){
    const type = this.variable.type.float?"text":"number"; // TODO implements other possible types
    const min = this.variable.type.float? "": (this.variable.type.signed? (-2^(this.variable.type.size-1)).toString():"0");
    const max = this.variable.type.float? "": (this.variable.type.signed? (2^(this.variable.type.size-1)-1) : (2^(this.variable.type.size)-1));

    const prompt = this.alertCtrl.create({
      title: this.variable.name,
      message: 'Enter the new value to register',
      inputs: [
        {
          name: 'newValue',
          type: type,
          min: min,
          max: max,          
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Register',
          handler: data => {
            this.ioTizeProvider.setVariableValue(this.variable, data.newValue);
          }
        }
      ]
    });
    prompt.present();
  }

}
