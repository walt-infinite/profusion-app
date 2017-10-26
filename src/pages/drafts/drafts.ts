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
    var postPicRef = firebase.database().ref(`/posts/drafts/${post.key}/`);

    let alert = this.alertCtrl.create({
      title: 'Supprimer le brouillon',
      message: 'Êtes-vous sûr de supprimer ce brouillon ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Supprimer',
          handler: () => {
            postPicRef.remove();

            //Remove from local array
            this.userfeed = this.userfeed.filter(function( obj ) {
              return obj.key !== post.key;
            });

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
