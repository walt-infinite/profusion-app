import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { OrganizePage } from '../organize/organize';

/**
 * Generated class for the CreateContainerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  template: '<ion-nav [root]="rootPage" [rootParams]="rootParams"></ion-nav>'
})
export class CreateContainerPage {
  rootPage = OrganizePage; // This is the page you want your modal to display
  rootParams;


  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
  	this.rootParams = Object.assign({}, navParams.data, {viewCtrl: viewCtrl});
  }

}
