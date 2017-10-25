import { Component } from '@angular/core';
import { NavController,ViewController,Platform,NavParams,AlertController,ModalController, ActionSheetController, LoadingController } from 'ionic-angular';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

//Action Pages
import { ProfilePage } from '../../profile/profile';
import { HomePage } from '../../home/home';
//Service Worker
import { PostData } from '../../../providers/post-data';
import { ProfileData } from '../../../providers/profile-data';

import { FormBuilder, Validators } from '@angular/forms';

import * as firebase from 'firebase/app';

@Component({
  selector: 'page-post-page',
  templateUrl: 'post-page.html',
  providers: [ProfileData]
})
export class PostPage {
  public postForm;
  userid: any;
  userProfile: any;
  usernameCheck: any;
  post: any = {};
  commentlist: any;
  clicked: any;
  postid: any;
  imagesList: any[] = [];
  likes: any;
  notification: any;
  islikedPost: any;
  firstvideo: any = true;
  publishing: any;

  constructor(public platform: Platform, public navCtrl: NavController, private navParams: NavParams,public db: AngularFireDatabase, public afAuth: AngularFireAuth,
  public viewCtrl: ViewController, public postdata: PostData,public alertCtrl: AlertController, public modalCtrl: ModalController,public profileData: ProfileData, public formBuilder: FormBuilder,
  public actionSheetCtrl: ActionSheetController, public loadingCtrl: LoadingController) {

    this.userid = firebase.auth().currentUser.uid;

    //Get Passed Parameters
    let params = this.navParams.get('post');
    this.publishing = this.navParams.get('publishing')

    //Check if User is Viewing a Notification
    if ( params.notification == true ) {
      this.postid = params.postid;

      firebase.database().ref('/posts/publish/' + params.postid).once('value', (snap) => {
        //If Viewing a Notification, fetch post meta from Firebase
        this.post = snap.val();
        this.notification = true;
        this.post.key = params.postid;
      })
    } else if ( this.publishing ) {
      let postRef = this.db.object(`/posts/publish/${params.key}/`)
      postRef.subscribe(snap => {
        this.post = snap;
        this.post.key = this.post.$key;
      })
    }
    else {
      //If they are coming from the front page, use the params for the meta info
      this.post = params;
    }

    //Setup the postid global variable
    if ( params.notification != true ) {
      this.postid = this.post.key;
    }

    //Get User Data -- TO DELETE
    this.profileData.getUserProfile().on('value', (data) => {
      this.userProfile = data.val();
    });

    //Get steps and turn them into arrays
    var stepsRef = '/posts/publish/'+this.postid+'/images';

    //Get Posts and turn them into arrays
    firebase.database().ref(stepsRef).once('value', (snapshot) => {
        this.imagesList = this.postdata.snapshotToArray(snapshot);
        this.imagesList.sort(this.sortFunction);
    });

    //Get the comment list in real time
    this.commentlist = this.db.list(`/comments/${this.postid}/`).map( (arr) => { return arr.reverse();});

    //Setup the comment form
    this.postForm = formBuilder.group({
      post: ['', Validators.compose([Validators.maxLength(180), Validators.required])]
    });

    //Check if the post has been liked
    let postLikersList = firebase.database().ref(`/likes/${this.postid}`);
        postLikersList.once("value")
          .then((snapshot) => {
          var postCheck = snapshot.hasChild(`${this.userid}`);
            //Check if UserId is On the List
            if (!postCheck) {
              this.post.islikedPost = false;
            } else {
              this.post.islikedPost = true;
            }
          });


  }

  sortFunction(a,b){
    if (a.position < b.position)
      return -1;
    if (a.position > b.position)
      return 1;
    return 0;
  }

  createComment(){
      this.clicked = true;
      if(!this.postForm.valid) {
      } else {
        this.postdata.createComment(this.post, this.userProfile, this.postForm.value.post);
        this.clicked = false;
        this.postForm.reset();
      }
  }


  likeComment(comment, postRef, userInfo) {
    let myId = this.userid;
    userInfo = this.userProfile;
    let postDataProvider = this.postdata;
    let commentLikersList = firebase.database().ref(`/posts/${postRef}/comments/${comment.key}/likers/`);
    //Alert Box for User
    let alert = this.alertCtrl.create({
      title: 'Sorry!',
      subTitle: 'You can only vote once!',
      buttons: ['OK']
    });
    //Query Post Likers List for User Key
    commentLikersList.once("value")
      .then(function(snapshot) {
      var postCheck = snapshot.hasChild(`${myId}`);
        //Check if UserId is On the List
        if (!postCheck) {
          //Like Comment
          postDataProvider.upVoteComment(comment, postRef, userInfo);
        } else {
          //Alert User is on the List
          alert.present();
        }
      });
  }
  dislikeComment(comment, postRef, userInfo) {
    let myId = this.userid;
    userInfo = this.userProfile;
    let postDataProvider = this.postdata;
    let commentLikersList = firebase.database().ref(`/posts/${postRef}/comments/${comment.$key}/likers/`);
    //Alert Box for User
    let alert = this.alertCtrl.create({
      title: 'Sorry!',
      subTitle: 'You can only vote once!',
      buttons: ['OK']
    });
    //Query Post Likers List for User Key
    commentLikersList.once("value")
      .then(function(snapshot) {
      var postCheck = snapshot.hasChild(`${myId}`);
        //Check if UserId is On the List
        if (!postCheck) {
          //Like Comment
          postDataProvider.downVoteComment(comment, postRef, userInfo);
        } else {
          //Alert User is on the List
          alert.present();
        }
      });
  }
  deleteComment(comment, postRef) {
    let prompt = this.alertCtrl.create({
      title: 'Delete Post?',
      message: "By doing so the world may never see this!",
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Naw Chill');
          }
        },
        {
          text: 'Delete',
          handler: data => {
            this.postdata.deleteComment(comment,postRef);
          }
        }
      ]
    });
    prompt.present();
  }

  likePost(post){
    let myId = this.userid;
    let userProfile = this.userProfile;
    let postDataProvider = this.postdata;
    let postLikersList = firebase.database().ref(`/likes/${post.key}`);

    //UI interaction
    if(this.post.islikedPost == true){
      this.post.likes--;
      this.post.islikedPost = false;
    }
    else {
      this.post.likes++;
      this.post.islikedPost = true;
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

  videoClicked(video) {
    video.play();
    video.muted = true;
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

            //Go back to home and reload feed
            this.navCtrl.setRoot(HomePage)
          }
        }
      ]
    });
    alert.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
