import { Component } from '@angular/core';
import { NavController,ModalController,NavParams,AlertController,ActionSheetController, Platform, LoadingController } from 'ionic-angular';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

//Service Worker
import { AuthData } from '../../providers/auth-data';
import { PostData } from '../../providers/post-data';
import { ProfileData } from '../../providers/profile-data';
//Detail Pages
import { PostPage } from '../details/post-page/post-page';
import { HomePage } from '../home/home';
import { SettingsPage } from '../details/settings/settings';
import { EditProfilePage } from '../edit-profile/edit-profile';

import * as firebase from 'firebase/app';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [ProfileData]
})
export class ProfilePage {
  userid: any;
  color: any;
  data: any;
  hideButt: boolean = false;
  profileconnect: any; 
  profile: string = "feed";
  public userProfile: any;
  userfeed: any[] = []; 
  userlist: any; 
  userfollowing: any; 
  userfollowers: any; 
  followingCount: any; 
  followerCount: any; 
  isFollowing: any; 
  userCalculatedStars: any; 
  blank: any;

  constructor(public platform: Platform, public navCtrl: NavController, private navParams: NavParams,
    public db: AngularFireDatabase, public afAuth: AngularFireAuth,public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public profileData: ProfileData, public postdata: PostData, public loadingCtrl: LoadingController, 
    public authdata: AuthData, public modalCtrl: ModalController) {
      this.userid = firebase.auth().currentUser.uid; 
      //When viewing a Profile we want that User's Data
      this.profileconnect = this.navParams.get('userProfile');

      //Get List of Users
      this.userlist = this.db.list(`/users/`);
      //If Not Viewing a User Assign My User Profile Data
      if (!this.profileconnect) {
        //Get Posts and turn them into arrays
          firebase.database().ref('/posts/publish').orderByChild("userid").equalTo(this.userid).once('value', (snapshot) => {
              this.userfeed = this.postdata.snapshotToArray(snapshot).reverse();
              if(this.userfeed.length == 0){
                this.blank = true;
              }
          });


        this.profileData.getUserProfile().on('value', (data) => {
          this.userProfile = data.val();
          //If Current User Hide Follow Button
          if(this.userProfile.userid == this.userid) {
            this.hideButt = true;
          }

          //Get Followers & Following
          this.userfollowing = this.db.list(`/users/${this.userid}/following/`);
          this.userfollowers = this.db.list(`/users/${this.userid}/followers/`);
          //Get Followers & Following Count
          this.userfollowing.subscribe(snaps=> {
            this.followingCount = snaps.length;
          })
          this.userfollowers.subscribe(snaps=> {
            this.followerCount = snaps.length;
          })
        });
      } else {
        //Assign User Profile To Viewing Profile Data
        this.userProfile = this.profileconnect;
        //If Current User Hide Follow Button
        if(this.userProfile.userid == this.userid) {
          this.hideButt = true;
        }
        //Get Posts and turn them into arrays
          firebase.database().ref('/posts/publish').orderByChild("userid").equalTo(this.profileconnect.userid).once('value', (snapshot) => {
              this.userfeed = this.postdata.snapshotToArray(snapshot).reverse();
          }); 
        //Get Followers & Following
        this.userfollowing = this.db.list(`/users/${this.userProfile.userid}/following/`);
        this.userfollowers = this.db.list(`/users/${this.userProfile.userid}/followers/`);
        //Get Followers & Following Count
        this.userfollowing.subscribe(snaps=> {
          this.followingCount = snaps.length;
        })
        this.userfollowers.subscribe(snaps=> {
          this.followerCount = snaps.length;
        })
        //While Viewing User Get Following List & See if Viewed User is On Your List
        let following = this.db.list(`/users/${this.userid}/following/${this.profileconnect.userid}`);
          following.subscribe(snapshots => {
            //User Following Conditions
            if (snapshots.length > 0) {
              this.isFollowing = true;
            } else if (snapshots.length < 1) {
              this.isFollowing = false;
            }
        })
     }
  }
  followUser(userProfile) {
    let followers = this.db.object(`/users/${userProfile.userid}/followers/${userProfile.userid}`);
    let following = this.db.object(`/users/${this.userid}/following/${userProfile.userid}`);
    following.set({
        userid: userProfile.userid
      }).then(_=> { 
        followers.set({
          userid: this.userid
        })
    });
  }
  unFollowUser(userProfile) {
    let followers = this.db.list(`/users/${userProfile.userid}/followers/`);
    let following = this.db.list(`/users/${this.userid}/following/`);
    following.remove(userProfile.userid).then(_=> { 
        followers.remove(userProfile.userid);
    });
  }
  viewProfile(user) {
    this.navCtrl.push(ProfilePage, {
      userProfile: user
    }); 
  }
  actionPost(post) {
    let myId = this.userid;
    let userProfile = this.userProfile;
    let postDataProvider = this.postdata;
    let postLikersList = firebase.database().ref(`/likes/${post.$key}`); 
    // Delete Refs for Post
    let postList = firebase.database().ref(`/posts/${post.$key}`);
    let notifyUserRef = firebase.database().ref(`/users/${this.userid}/notifications/${post.$key}`);
    //Alert Box for Delete
    let alertDelete = this.alertCtrl.create({
      title: 'Are you sure?',
      subTitle: 'You are about to delete this post!',
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: data => {
            if (post.userid == this.userid) {
              postList.remove().then(_=> {
                  notifyUserRef.remove();
              });
            }
          }
        }
      ]
    });
    //Alert Box for User Re-Voting
    let alertVote = this.alertCtrl.create({
      title: 'Sorry!',
      subTitle: 'You can only vote once!',
      buttons: ['OK']
    });
    //Action Controller for Post
    let actionSheet = this.actionSheetCtrl.create({
      title: 'What do you want to do?',
      buttons: [
        {
          text: 'View Post',
          handler: () => {
            if (post.type == 'post') {
              this.navCtrl.push(PostPage, {
                post: post
              }); 
            }
          }
        },{
          text: 'Like Post',
          handler: () => {
          //Query Post Likers List for User Key 
          postLikersList.once("value")
            .then(function(snapshot) {
            var postCheck = snapshot.hasChild(`${myId}`);
              //Check if UserId is On the List
              if (!postCheck) {
                //Like Post
                postDataProvider.upVotePost(post, userProfile);
              } else {
                //Alert User is on the List
                alertVote.present();
              }
            });
          }
        },{
          text: 'Dislike Post',
          handler: () => {
          //Query Post Likers List for User Key 
          postLikersList.once("value")
            .then(function(snapshot) {
            var postCheck = snapshot.hasChild(`${myId}`);
              //Check if UserId is On the List
              if (!postCheck) {
                //Like Post
                postDataProvider.downVotePost(post, userProfile);
              } else {
                //Alert User is on the List
                alertVote.present();
              }
            });
          }
        },
        {
          text: 'Delete Post',
          role: 'destructive',
          handler: () => {
            //Alert User Delete Box
            alertDelete.present();
          }
        },{
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
  imgError(post) {
    post.profilepic = 'assets/img/profilepic.jpg';
  }

  likePost(post){
    let myId = this.userid;
    let userProfile = this.userProfile;
    let postDataProvider = this.postdata;
    let postLikersList = firebase.database().ref(`/likes/${post.$key}`); 

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

  setLiked(post) {
    let myId = this.userid;
    let postLikersList = firebase.database().ref(`/likes/${post.$key}`); 

    //Query Post Likers List for User Key 
    postLikersList.once("value")
      .then(function(snapshot) {
      var postCheck = snapshot.hasChild(`${myId}`);
        //Check if UserId is On the List
        if (!postCheck) {
          //Like Post
          post.islikedPost = false;
        } else {
          //Unlike post
          post.islikedPost = true;
        }
      });
  }

  viewPost(post){
    this.navCtrl.push(PostPage, {
      post: post
    }); 
  } 
  
  goHome(){
    this.navCtrl.setRoot(HomePage);
  }

  goToSettings(){
      this.navCtrl.push(SettingsPage); 
  }

  goToEditProfile(){
      let profileModal = this.modalCtrl.create(EditProfilePage);
      profileModal.present();
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
    video.play();
    video.muted= true;
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
            this.userfeed = this.userfeed.filter(function( obj ) {
              return obj.key !== post.key;
            });
          }
        }
      ]
    });
    alert.present();
  }

}
