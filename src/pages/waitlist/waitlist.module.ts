import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaitlistPage } from './waitlist';

@NgModule({
  declarations: [
    WaitlistPage,
  ],
  imports: [
    IonicPageModule.forChild(WaitlistPage),
  ],
})
export class WaitlistPageModule {}
