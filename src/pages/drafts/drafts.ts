import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, ModalController } from 'ionic-angular';

import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';

//Service Worker
import { PostData } from '../../providers/post-data';

import {CreateContainerPage} from '../create-container/create-container';

/**
 * Generated class for the DraftsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-drafts',
  templateUrl: 'drafts.html',
})
export class DraftsPage {

	userid: any;
	userfeed: any;
	showCloseBtn: any;
  actions: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public db: AngularFireDatabase, 
    public alertCtrl: AlertController, public modalCtrl: ModalController, public postdata: PostData) {

  		this.userid = firebase.auth().currentUser.uid; 
  		this.showCloseBtn = this.navParams.get('showCloseBtn');

      firebase.database().ref('/posts/drafts').orderByChild("userid").equalTo(this.userid).once('value', (snapshot) => {
          this.userfeed = this.postdata.snapshotToArray(snapshot).reverse();
      }); 

      console.log(this.userid);
  }

  
  viewCreator(post){
    if(this.showCloseBtn == true){
      this.viewCtrl.dismiss({
          post: post
       });
    }
    else {
       let modal = this.modalCtrl.create(CreateContainerPage, {
          post: post
        });
       modal.present();
    }
  } 

  delete(post){
    var postPicRef = firebase.database().ref(`/posts/drafts/${post.$key}/`);

    let alert = this.alertCtrl.create({
      title: 'Delete draft',
      message: 'Do you want to delete this draft?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            postPicRef.remove();
          }
        }
      ]
    });
    alert.present();
  }

  dismiss() {
    this.viewCtrl.dismiss({
      nochoice: true
    });
  }

}
