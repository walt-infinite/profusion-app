import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateContainerPage } from './create-container';

@NgModule({
  declarations: [
    CreateContainerPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateContainerPage),
  ],
})
export class CreateContainerPageModule {}
