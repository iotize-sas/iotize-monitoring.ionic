import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BundlePage } from './bundle';

@NgModule({
  declarations: [
    BundlePage,
  ],
  imports: [
    IonicPageModule.forChild(BundlePage),
  ],
})
export class BundlePageModule {}
