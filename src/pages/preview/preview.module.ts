import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PreviewPage } from './preview';

@NgModule({
  declarations: [
    PreviewPage,
  ],
  imports: [
    IonicPageModule.forChild(PreviewPage),
  ],
})
export class PreviewPageModule {}
