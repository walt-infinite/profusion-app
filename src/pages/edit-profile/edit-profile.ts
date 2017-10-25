import { Component } from '@angular/core';
import { NavController,ViewController,AlertController,Platform } from 'ionic-angular';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
//Service Worker
import { AuthData } from '../../providers/auth-data';
import { ProfileData } from '../../providers/profile-data';
import { Camera } from '@ionic-native/camera';

import * as firebase from 'firebase/app';
import 'firebase/storage';

import {Login} from '../auth/login/login';

/**
 * Generated class for the EditProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  public userid: any;
  public userProfile: any;
  public birthDate: string;
  public userPicture: string;
  public loading: any;

  constructor(public platform: Platform, public navCtrl: NavController,public db: AngularFireDatabase, public afAuth: AngularFireAuth,public alertCtrl: AlertController, 
    public userData: ProfileData, public authdata: AuthData, private camera: Camera, public viewCtrl: ViewController) {
    this.userid = firebase.auth().currentUser.uid; 
    this.userData = userData;
    this.userData.getUserProfile().on('value', (data) => {
      this.userProfile = data.val();
      this.birthDate = this.userProfile.birthDate;
    });
  }

  takePicture(){
    let userRef = this.userid;
    let fireStorRef = firebase.storage().ref(`/users/`);
    let userPicRef = firebase.database().ref(`/users/${userRef}`);
    
    this.camera.getPicture({
      quality : 95,
      destinationType : this.camera.DestinationType.DATA_URL,
      sourceType : this.camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit : true,
      encodingType: this.camera.EncodingType.PNG,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: true
    }).then(imageData => {
      this.userPicture = imageData;
      this.loading = true;
      //Userpic handler
      if (this.userPicture != null) {
        fireStorRef.child(userRef).child('profilePicture.png')
      .putString(this.userPicture, 'base64', {contentType: 'image/png'})
        .then((savedPicture) => {
          userPicRef.child('profilepic').set(savedPicture.downloadURL);
          this.loading = false;
        });        
      }
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }

  updateName(){
    let alert = this.alertCtrl.create({
      message: "Your first name & last name",
      inputs: [
        {
          name: 'fullName',
          placeholder: 'Your full name',
          value: this.userProfile.fullName
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.userData.updateName(data.fullName);
          }
        }
      ]
    });
    alert.present();
  }
  updateUserName(){
    let alertTaken = this.alertCtrl.create({
      title: 'Username Taken!',
      subTitle: 'Please try again.',
      buttons: ['OK']
    });
    let alertInvalid = this.alertCtrl.create({
      title: 'Please enter a valid username!',
      subTitle: 'No special characters and must be longer than 6 characters.',
      buttons: ['OK']
    });
    let alert = this.alertCtrl.create({
      message: "Your username",
      inputs: [
        {
          name: 'username',
          placeholder: 'Your username',
          value: this.userProfile.username
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            //vars
            let newName = data.username;
            let userRef = this.userid;
            let currentName = this.userProfile.username;
            //Validate username
            if(/^[a-zA-Z0-9- ]*$/.test(data.username) == false) {
              alertInvalid.present();
            } else {
              //data
              let usernamePushRef = firebase.database().ref(`/usernames/`); 
              let usernameRef = firebase.database().ref(`/usernames/${newName}`);
              let currentUserRef = firebase.database().ref(`/usernames/${currentName}`);
              usernamePushRef.once("value")
                .then(function(snapshot) {
                  var postCheck = snapshot.hasChild(newName);
                  if (!postCheck) {
                    let userPro = firebase.database().ref('/users/');
                    return userPro.child(userRef).update({
                      username: newName,
                    }).then(_=> {
                      usernameRef.set({
                        userid: userRef
                      })
                    }).then(_=> {
                      currentUserRef.remove();
                    })
                  } else {
                    alertTaken.present();
                  }
              });
            }
          }
        }
      ]
    });
    alert.present();
  }
  updateBio(){
    let alert = this.alertCtrl.create({
      message: "Your bio",
      inputs: [
        {
          name: 'bio',
          placeholder: 'Enter bio',
          value: this.userProfile.bio
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.userData.updateBio(data.bio);
          }
        }
      ]
    });
    alert.present();
  }
  updateWebsite(){
    let alert = this.alertCtrl.create({
      message: "Your website link",
      inputs: [
        {
          name: 'website',
          placeholder: 'Enter website',
          value: this.userProfile.website,
          type: 'url'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.userData.updateWebsite(data.website);
          }
        }
      ]
    });
    alert.present();
  }
  updateDOB(birthDate){
    this.userData.updateDOB(birthDate);
  }
  updateEmail(){
    let alert = this.alertCtrl.create({
      inputs: [
        {
          name: 'newEmail',
          placeholder: 'Your new email',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.userData.updateEmail(data.newEmail);
          }
        }
      ]
    });
    alert.present();
  }
  updatePassword(){
    let alert = this.alertCtrl.create({
      inputs: [
        {
          name: 'newPassword',
          placeholder: 'Your new password',
          type: 'password'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.userData.updatePassword(data.newPassword);
          }
        }
      ]
    });
    alert.present();
  }
  launchURL(postUrl) {
    this.platform.ready().then(() => {
        open(postUrl, "_system", "location=true");
    });
  }
  logout() {
    this.authdata.logoutUser();
    this.navCtrl.setRoot(Login);
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
