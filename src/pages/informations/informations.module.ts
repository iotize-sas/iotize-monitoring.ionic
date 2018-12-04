import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InformationsPage } from './informations';

@NgModule({
  declarations: [
    InformationsPage,
  ],
  imports: [
    IonicPageModule.forChild(InformationsPage),
  ],
})
export class InformationsPageModule {}
