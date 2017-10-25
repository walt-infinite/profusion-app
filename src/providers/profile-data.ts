/**
* This should come as no surprise, we need to import Injectable so we can use this provider as an injectable.
* We also need to import firebase so we can talk to our DB.
*/
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import * as firebase from 'firebase/app';

@Injectable()
export class ProfileData {
  userProfile: any; 
  currentUser: any; 

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
    this.currentUser = firebase.auth().currentUser;
    this.userProfile = firebase.database().ref('/users/');
  }
  getUserProfile(): any {
    this.currentUser = firebase.auth().currentUser;
    return this.userProfile.child(this.currentUser.uid);
  }
  updateName(fullName: string): any {
    return this.userProfile.child(this.currentUser.uid).update({
      name: fullName,
    });
  }
  updateBio(bio: string): any {
    return this.userProfile.child(this.currentUser.uid).update({
      bio: bio,
    });
  }
  updateWebsite(website: string): any {
    return this.userProfile.child(this.currentUser.uid).update({
      website: website,
    });
  }
  updateDOB(birthDate: string): any {
    return this.userProfile.child(this.currentUser.uid).update({
      birthDate: birthDate,
    });
  }

  initUserProfile(uid): any{
     var whitelisted: any;
     firebase.database().ref('/users/'+uid).once('value', (snapshot) => {
         whitelisted = snapshot.val().whitelisted;

         if(whitelisted == true){
           return true;
         }
         else {
           return false;
         }
      })
      
     
  }

  /**
  * This is were things get trickier, this one is taking the user's email and first it's calling the 
  * this.currentUser auth reference to call it's updateEmail() function, it's very important that you
  * understand that this is changing your email in the AUTH portion of firebase, the one stored in the 
  * userProfile/uid node hasn't changed.
  * After it successfully changes your email in the AUTH portion of firebase it updates your email in the
  * real time database in the userProfile/uid node.
  */
  updateEmail(newEmail: string): any {
    this.currentUser.updateEmail(newEmail).then(() => {
      this.userProfile.child(this.currentUser.uid).update({
        email: newEmail
      });
    }, (error) => {
      console.log(error);
    });
  }

  /**
  * Just like before this is changing the user's password, but remember, 
  * this has nothing to do with the database this is the AUTH portion of 
  * Firebase.
  */
  updatePassword(newPassword: string): any {
    this.currentUser.updatePassword(newPassword).then(() => {
      console.log("Password Changed");
    }, (error) => {
      console.log(error);
    });
  }
}