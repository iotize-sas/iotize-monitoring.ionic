import { NgModule } from '@angular/core';
import { BundleComponent } from './bundle/bundle';
import { VariableComponent } from './variable/variable';
import { LoginComponent } from './login/login';
import { IotizeHeaderComponent } from './iotize-header/iotize-header';
@NgModule({
	declarations: [BundleComponent,
    VariableComponent,
    LoginComponent,
    IotizeHeaderComponent],
	imports: [],
	exports: [BundleComponent,
    VariableComponent,
    LoginComponent,
    IotizeHeaderComponent]
})
export class ComponentsModule {}
