import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

//Detail Pages
import { PostPage } from '../details/post-page/post-page';

import * as firebase from 'firebase/app';


@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class Notifications {
  userid: any;
  userfeed: any;
  blank: any;

  constructor(public navCtrl: NavController,public db: AngularFireDatabase, public afAuth: AngularFireAuth) {
      this.userid = firebase.auth().currentUser.uid;
      this.userfeed = this.db.list(`/notifications/${this.userid}`).map( (arr) => { return arr.reverse(); } );
  }
  viewPost(post){
    this.navCtrl.push(PostPage, {
      post: post
    });
  }
  imgError(post) {
    post.profilepic = 'assets/img/profilepic.jpg';
    post.likedProfilepic = 'assets/img/profilepic.jpg';
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2500);
  }
}
