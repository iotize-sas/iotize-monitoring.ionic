import { NgModule } from "@angular/core";
import { BleSettingsComponent } from "./ble-settings/ble-settings";
import { IonicModule } from "ionic-angular";
import { BleComProvider } from "./ble-com/ble-com";


@NgModule({
    declarations: [
        BleSettingsComponent
    ],
    imports: [
        IonicModule
    ],
    providers: [
        BleComProvider
    ],
    exports: [
        BleSettingsComponent
    ]
})
export class IotizeBleModule {}