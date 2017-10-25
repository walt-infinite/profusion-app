import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrganizePage } from './organize';

@NgModule({
  declarations: [
    OrganizePage,
  ],
  imports: [
    IonicPageModule.forChild(OrganizePage),
  ],
})
export class OrganizePageModule {}
