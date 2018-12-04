import { Component } from '@angular/core';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { IoTizeProvider } from '../../iotize-monitoring/globals/io-tize/io-tize';

/**
 * Generated class for the LoginComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginComponent {
  constructor(public ioTizeProvider: IoTizeProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) {
  }

  loginPrompt() {
    if (this.ioTizeProvider.isReady) {
      this.openLoginAlert();
    } else console.log('device not ready yet');
  }

  /**
   * Creates and open an alert with a login credentials form. Calls login method on validation
   */

  openLoginAlert() {
    const prompt = this.alertCtrl.create({
      title: "Login",
      message: 'Enter your credentials',
      inputs: [
        {
          name: 'userName',
          type: 'text',
          placeholder: 'Username'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
            return false;
          }
        },
        {
          text: 'Login',
          handler: data => {
            prompt.dismiss();
            this.login(data.userName, data.password);
            return false;
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * logout current user from the tap. Displays a loader while waiting for tap response
   * @returns {Promise<void>}
   */

  async logout() {
    let loading = this.loadingCtrl.create({
      content: 'Logging out'
    });

    loading.present();
    try {
      await this.ioTizeProvider.logout();
      loading.dismiss();
    } catch (err) {
      console.error(err);
      loading.dismiss();
      this.showToast('Logout failed');
    }
  }
  /**
   * login with the given credentials. Displays a loader while waiting for tap response
   *
   * @param {string} username 
   * @param {string} password
   * @returns {Promise<void>}
   */
  async login(username: string, password: string) {
    let loading = this.loadingCtrl.create({
      content: 'Logging in'
    });

    loading.present();
    try {
      await this.ioTizeProvider.login(username, password);
      loading.dismiss();

    } catch (err) {
      console.error(err);
      loading.dismiss();
      this.showToast('Login failed');
    }
  }

  /**
   * Displays a toast
   * @param {string} msg - message to display within the toast
   * @param {number} duration - duration of the toast
   */

  showToast(msg: string, duration?: number) {
    console.log(msg);
    const toast = this.toastCtrl.create({
      message: msg,
      duration: duration || 3000
    });
    toast.present();
  }

}
