import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';

@Injectable()
export class AuthData {
  fireAuth: any;
  userid: any;
  db: any;
  user: any;
  posts: any;

  constructor(public afAuth: AngularFireAuth) {
    afAuth.authState.subscribe( user => {
      if (user) {
        //this.fireAuth = user.auth;
        this.userid = firebase.auth().currentUser.uid;
      } else {
        this.userid = 'public'
      }
    });
    this.db = firebase.database().ref('/');
    this.user = firebase.database().ref('/users/');
    this.posts = firebase.database().ref('/posts/');
  }
  loginUser(newEmail: string, newPassword: string): any {
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }
  logoutUser(): any {
    return this.afAuth.auth.signOut();
  }
  resetPassword(email: string): any {
    return firebase.auth().sendPasswordResetEmail(email);
  }
  signupUser(newEmail: string, newPassword: string, fullName: string): any {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword).then((newUser) => {
      this.user.child(newUser.uid).set({
        email: newEmail,
        name: fullName,
        profilepic: "assets/img/profilepic.jpg",
        verified: false,
        userid: newUser.uid,
        post_count: 0,
        whitelisted: false
      });
    }).then(_ =>{
      firebase.auth().onAuthStateChanged(function(user) {
        user.sendEmailVerification();
      });
    });
  }

}