import { Component } from '@angular/core';
import { InformationsPage } from '../informations/informations';
import { SettingsPage } from '../settings/settings';
import { ConfigProvider } from '../../iotize-monitoring/globals/config/config';
import { BundlePage } from '../bundle/bundle';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = BundlePage;
  tab2Root = SettingsPage;
  tab3Root = InformationsPage;

  constructor(protected configProvider: ConfigProvider) {

  }
}
