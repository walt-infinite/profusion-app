import { Component } from '@angular/core';
import { NavController,ModalController,AlertController, ActionSheetController, LoadingController, App } from 'ionic-angular';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

//Service Worker
import { AuthData } from '../../providers/auth-data';
import { PostData } from '../../providers/post-data';
import { ProfileData } from '../../providers/profile-data';
//Detail Pages
import { PostPage } from '../details/post-page/post-page';
import { SettingsPage } from '../details/settings/settings';
//Actions
import {CreatePost} from '../actions/create-post/create-post';
import {ProfilePage} from '../profile/profile';
import {CreateContainerPage} from '../create-container/create-container';
import {WaitlistPage} from '../waitlist/waitlist';

import * as firebase from 'firebase/app';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ProfileData]
})
export class HomePage {
  userid: any;
  userProfile: any;
  usernameCheck: any;
  public postlist: any[] = []; 
  followlist: any;
  lastKey: any;
  infinite: any = true;
  ProfileData: any;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public authdata: AuthData,
   public db: AngularFireDatabase, public afAuth: AngularFireAuth, public postdata: PostData,public alertCtrl: AlertController,public profileData: ProfileData,
   public actionSheetCtrl: ActionSheetController, public loadingCtrl: LoadingController, private app: App) {

    this.userid = firebase.auth().currentUser.uid; 
    this.profileData.getUserProfile().on('value', (data) => {
      this.userProfile = data.val();
    });

    //Get Posts and turn them into arrays
    firebase.database().ref('/posts/publish').orderByChild("published_at").limitToLast(3).once('value', (snapshot) => {
        this.postlist = this.postdata.snapshotToArray(snapshot).reverse();
        this.lastKey = (this.postlist.slice(-1)[0]).published_at;
    });
    
    this.followlist = this.db.list(`/users/${this.userid}/following/`);

  }

  //like and unlike
  likePost(post){
    let myId = this.userid;
    let userProfile = this.userProfile;
    let postDataProvider = this.postdata;
    let postLikersList = firebase.database().ref(`/likes/${post.key}`); 

    //UI interaction
    if(post.islikedPost == true){
      post.likes--;
      post.islikedPost = false;
    }
    else {
      post.likes++;
      post.islikedPost = true;
    }

    //Query Post Likers List for User Key 
    postLikersList.once("value")
      .then(function(snapshot) {
      var postCheck = snapshot.hasChild(`${myId}`);
        //Check if UserId is On the List
        if (!postCheck) {
          //Like Post
          postDataProvider.upVotePost(post, userProfile);
        } else {
          //Unlike post
          postDataProvider.unVotePost(post, userProfile);
        }
      });
  } 

  viewPost(post){
    this.navCtrl.push(PostPage, {
      post: post
    }); 
  } 

  viewProfile(userid){
    let profileUser = this.userProfile;
    let navCtrl = this.navCtrl;

    profileUser = firebase.database().ref('/users/' + userid).once('value').then(function(snapshot) {
      profileUser = snapshot.val();

      navCtrl.push(ProfilePage, {
        userProfile: profileUser
      }); 
    });
  } 

  createPost(){
    let modal = this.modalCtrl.create(CreateContainerPage, {
      post: "",
      posting: true,
      commenting: false
    });
    modal.present();
  }
  imgError(post) {
    post.profilepic = 'assets/img/profilepic.jpg';
  }

  doRefresh(refresher) {

    setTimeout(() => {
      //Get Posts and turn them into arrays
      firebase.database().ref('/posts/publish').orderByChild("published_at").limitToLast(3).once('value', (snapshot) => {
          this.postlist = this.postdata.snapshotToArray(snapshot).reverse();
          this.lastKey = (this.postlist.slice(-1)[0]).published_at;
          this.infinite = true;
      });
      refresher.complete();
    }, 2500);
  }

  getThumb(post){
    var images = post.images;
    var tmp;
    var image;
    var lowest:any = Number.POSITIVE_INFINITY;

    for( var key in images) {
        tmp = images[key].position;
        if (tmp < lowest) { 
          lowest = tmp;
          image = images[key].url;
        }
    }
    return image;
  }

  videoClicked(video) {
    video.muted = true;
     setTimeout(() => {
       video.setAttribute("style","width:100%");
     }, 1000);
  }

  contextMenu(post){
    const actionSheet = this.actionSheetCtrl.create({
     buttons: [
       {
         text: 'Delete recipe',
         role: 'destructive',
         handler: () => {
           this.delete(post);
         }
       },
       {
         text: 'Cancel',
         role: 'cancel',
         handler: () => {
           console.log('Cancel clicked');
         }
       }
     ]
   });

   actionSheet.present();
  }

  delete(post){
    var postPicRef = firebase.database().ref(`/posts/publish/${post.key}/`);

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
            const loading = this.loadingCtrl.create({
              content: 'Deleting recipe...',
              spinner: 'crescent'
            });

            loading.present();

            //Remove remote location
            postPicRef.remove().then(_=>{
              loading.dismiss();
            });

            //Remove from local array
            this.postlist = this.postlist.filter(function( obj ) {
              return obj.key !== post.key;
            });
          }
        }
      ]
    });
    alert.present();
  }

  doInfinite(infiniteScroll){
    console.log('Begin async operation');
    let req:any;

    setTimeout(() => {
      //Get Posts and turn them into arrays
      firebase.database().ref('/posts/publish').orderByChild("published_at").limitToLast(3).endAt(this.lastKey-1).once('value', (snapshot) => {
          if(snapshot.val() == null) {
            console.log('Nothing here');
            this.infinite = false;
            return;
          }
          else {
            req = this.postdata.snapshotToArray(snapshot).reverse();

            this.lastKey = (req.slice(-1)[0]).published_at;
            console.log(this.lastKey);
            console.log(req);

            //Merge the two arrays
            this.postlist.push.apply(this.postlist, req);
          }
      })

      infiniteScroll.complete();
    }, 500);
  }

}
