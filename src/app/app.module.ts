import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BundleComponent } from '../components/bundle/bundle';
import { VariableComponent } from '../components/variable/variable';
import { InformationsPage } from '../pages/informations/informations';
import { BundlePage } from '../pages/bundle/bundle';
import { SettingsPage } from '../pages/settings/settings';
import { LoginComponent } from '../components/login/login';
import { IotizeHeaderComponent } from '../components/iotize-header/iotize-header';
import { IoTizeProvider } from '../iotize-monitoring/globals/io-tize/io-tize';
import { ConfigProvider } from '../iotize-monitoring/globals/config/config';
import { IotizeBleModule } from '../iotize-monitoring/protocols/ble-module/iotize-ble.module';

// Setting local (number formatting)
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { HTTP } from '@ionic-native/http';
import { NFC } from '@ionic-native/nfc';
import { NfcProvider } from '../iotize-monitoring/globals/nfc/nfc';

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    MyApp,
    SettingsPage,
    InformationsPage,
    TabsPage,
    BundlePage,
    BundleComponent,
    VariableComponent,
    LoginComponent,
    IotizeHeaderComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IotizeBleModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SettingsPage,
    InformationsPage,
    TabsPage,
    BundlePage,
    BundleComponent,
    VariableComponent,
    LoginComponent,
    IotizeHeaderComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    NFC,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    IoTizeProvider,
    ConfigProvider,
    NfcProvider
  ]
})
export class AppModule {}
