import { Injectable, EventEmitter } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NFC, Ndef } from '@ionic-native/nfc';
import { NFCHelper } from './nfcHelper';
import { DiscoveredDeviceType } from '@iotize/cordova-plugin-iotize-ble';

/*
  Generated class for the NfcProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NfcProvider {

  public tagFound = new EventEmitter<DiscoveredDeviceType>();

  constructor(public platform: Platform,
              public nfc: NFC) {
    console.log('Hello NfcProvider Provider');
    this.platform.ready().then( () => {
      this.listenNFC();
    });
  }

  listenNFC() {
    this.nfc.addNdefListener(() => {
      console.log('NFC listener ON')
    },
    (error) => {
      console.error('NFC listener didn\'t start: ', error)
    }).subscribe( event => {
      this.onDiscoveredTap(event);
    });
  }

  onDiscoveredTap(discoverEvent) {
    if (discoverEvent && discoverEvent.tag && discoverEvent.tag.id) {
      console.log(discoverEvent.tag);
      
      const tapAddress = NFCHelper.bytesToBleMACAddress(discoverEvent.tag.ndefMessage[2].payload); // third record of the tap is BLE Address
      console.log(tapAddress);

      const tapName = NFCHelper.bytesToASCII(discoverEvent.tag.ndefMessage[3].payload); // fourth record of the tap is tap name

      this.tagFound.emit({
        name: tapName,
        address: tapAddress
      });

    } else {
      console.error('couldn\'t get tag ID')
    }
  }

}
