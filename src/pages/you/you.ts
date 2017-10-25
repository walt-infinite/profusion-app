import { Component } from '@angular/core';
import { NavController,ModalController,NavParams,AlertController,ActionSheetController, Platform } from 'ionic-angular';

import { SettingsPage } from '../details/settings/settings';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

//Service Worker
import { AuthData } from '../../providers/auth-data';
import { PostData } from '../../providers/post-data';
import { ProfileData } from '../../providers/profile-data';
//Detail Pages
import { PostPage } from '../details/post-page/post-page';
import { HomePage } from '../home/home';
import { ProfilePage } from '../profile/profile';
import { DraftsPage } from '../drafts/drafts';
import { EditProfilePage } from '../edit-profile/edit-profile';

import {Login} from '../auth/login/login';

import * as firebase from 'firebase/app';

/**
 * Generated class for the YouPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-you',
  templateUrl: 'you.html',
  providers: [ProfileData]
})
export class YouPage {

  userid: any;
  color: any;
  data: any;
  hideButt: boolean = false;
  profileconnect: any; 
  profile: string = "feed";
  public userProfile: any;
  userfeed: any; 
  userlist: any; 
  userfollowing: any; 
  userfollowers: any; 
  followingCount: any; 
  followerCount: any; 
  isFollowing: any; 
  userCalculatedStars: any; 

  constructor(public platform: Platform, public navCtrl: NavController, private navParams: NavParams,
    public db: AngularFireDatabase, public afAuth: AngularFireAuth,public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public profileData: ProfileData, public postdata: PostData, 
    public authdata: AuthData, public modalCtrl: ModalController) {

  	this.userid = firebase.auth().currentUser.uid; 
      //When viewing a Profile we want that User's Data
      this.profileconnect = this.navParams.get('userProfile');
      //Get List of Users
      this.userlist = this.db.list(`/users/`);
      //If Not Viewing a User Assign My User Profile Data
      if (!this.profileconnect) {
        this.profileData.getUserProfile().on('value', (data) => {
          this.userProfile = data.val();
          //If Current User Hide Follow Button
          if(this.userProfile.userid == this.userid) {
            this.hideButt = true;
          }
        });
      }
     }

    viewProfile(){
    	this.navCtrl.push(ProfilePage);
  	}

    goToDrafts(){
      this.navCtrl.push(DraftsPage); 
    } 

    goToSettings(){
      this.navCtrl.push(SettingsPage); 
    } 

    goToEditProfile(){
      let profileModal = this.modalCtrl.create(EditProfilePage);
      profileModal.present();
    }

    logout() {
      this.authdata.logoutUser();
      this.navCtrl.setRoot(Login);
    }

  }
