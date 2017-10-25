import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController } from 'ionic-angular';
import { PostData } from '../../providers/post-data';
import { ProfileData } from '../../providers/profile-data';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

/**
 * Generated class for the PreviewPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-preview',
  templateUrl: 'preview.html',
})
export class PreviewPage {

  public postid: any;
  public imagesList: any[] = [];
  userid: any;
  userProfile: any;
  post: any;
  title: any;
  profilepic: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, public alertCtrl: AlertController, public postdata: PostData,
    public profileData: ProfileData, public viewCtrl: ViewController) {
  	this.postid = this.navParams.get('postid');
    this.userid = firebase.auth().currentUser.uid;
    this.post = {};

    //Get post meta
    firebase.database().ref('/posts/drafts/'+this.postid).once('value', (snapshot) => {
      this.post = snapshot.val();
    });

    //Get steps and turn them into arrays
    var stepsRef = '/posts/drafts/'+this.postid+'/images';
    firebase.database().ref(stepsRef).once('value', (snapshot) => {
        this.imagesList = this.postdata.snapshotToArray(snapshot);
        //Sort the array by position
        this.imagesList.sort(this.sortFunction);
    });

    //Get User Data
    this.profileData.getUserProfile().on('value', (data) => {
      this.userProfile = data.val();
      this.profilepic = this.userProfile.profilepic;
    });
  }

  sortFunction(a,b){
    if (a.position < b.position)
      return -1;
    if (a.position > b.position)
      return 1;
    return 0;
  }

  videoClicked(video) {
    video.play();
     video.muted= true;
  }

  publish(){
    let alert = this.alertCtrl.create({
      title: 'Ready to shine?',
      message: 'Publish this recipe to the community',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Publish',
          handler: () => {

          	var oldRef = firebase.database().ref('/posts/drafts/' + this.postid);
            var newRef = firebase.database().ref('/posts/publish/' + this.postid);
          	var userRef = firebase.database().ref('/users/' + this.userid);

          	var postid = this.postid;
          	var db = this.db;

            //Get the value from the drafts
          	oldRef.once('value', (snap) => {

            //Assign it to the published posts
		        newRef.set( snap.val(), (error) => {
		            if( error && typeof(console) !== 'undefined' && console.error ) {  console.error(error); }
		        }).then((success) => {
              let postRef = db.object(`/posts/publish/${postid}/`);

              newRef.update({
                published_at: new Date().getTime()
              });

				      postRef.subscribe(snap => {
                //Close the global modal and pass the post 
					        this.navParams.get('viewCtrl').dismiss(this.navParams.get('post')).then((success) => {
                    //Update the posts count of the user
                    userRef.child(`post_count`).transaction(function(post) {
                      post += 1;
                      return post;
                    });
                }); 
				      })
		        }).then((success) => {
               //Remove the drafts node
               oldRef.remove();
            });
	        });

          }
        }
      ]
    });
    alert.present();
  }

}
