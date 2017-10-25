import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Signup } from '../auth/signup/signup';
import { Login } from '../auth/login/login';

/**
 * Generated class for the IndexPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-index',
  templateUrl: 'index.html',
})
export class IndexPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  pushLogin(){
    this.navCtrl.push(Login);
  }

  pushSignup(){
    this.navCtrl.push(Signup);
  }
}
