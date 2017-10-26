import { Nav, Platform } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { ChangeDetectorRef } from '@angular/core';
import { SelectPhotoPage } from '../select-photo/select-photo';
import { PreviewPage } from '../preview/preview';
import { DraftsPage } from '../drafts/drafts';

import { FormBuilder, Validators } from '@angular/forms';
import { PostData } from '../../providers/post-data';
import { ProfileData } from '../../providers/profile-data';

import { LoadingController } from 'ionic-angular';

import { File } from '@ionic-native/file';

import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';

import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import 'firebase/storage';

@Component({
  selector: 'page-organize',
  templateUrl: 'organize.html',
  providers: [ProfileData],
})
export class OrganizePage {

  public postForm;

  public postid: any = false;

  public imagesList: any;
  public stepsIndex: any;
  public instagramPicker: any;
  public userid: any;
  public post: any = false;
  public userProfile: any;

  public userRef: any;
  public title: any;

  public creating: any = false;
  public uploading: any = false;
  public loading: any;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public navParams: NavParams, public db: AngularFireDatabase,
  public formBuilder: FormBuilder, public postdata: PostData, public profileData: ProfileData, platform: Platform, private cordovaFile: File,
  private cdRef : ChangeDetectorRef, public loadingCtrl: LoadingController, public actionSheetCtrl: ActionSheetController) {

    //Init the postid if it has been passed as param
    if(this.navParams.get('post')){
      var loading = this.loadingCtrl.create({
          spinner: 'crescent',
          content: 'Chargement de la recette...'
        });

      loading.present();

      var localPost = this.postdata.firebaseToLocal(this.navParams.get('post'));
      this.post = localPost;
      this.title = this.post.title;
      this.postid = this.post.key;

      setTimeout(()=>{ loading.dismiss() }, 1500);
    }

    this.userid = firebase.auth().currentUser.uid;

    //Get User Info to Post
    this.profileData.getUserProfile().on('value', (data) => {
      this.userProfile = data.val();
    });

    if(this.post){
      this.imagesList = this.post.images;
    }
    else {
      this.imagesList = [];
    }

    this.postForm = formBuilder.group({
      post: [''],
      title: ['']
    });

    this.stepsIndex = 0;
  }


  photoSelect(image){
    this.userRef = this.userid;

    //Create local array with all the metadata
    if(this.post == false){
      this.post = this.postdata.createLocalPost(this.userProfile);
    }

     //Check if the post is created in Firebase
     if(this.postid == false && this.creating == false){
         //If not, create it with the title
         var firepost = this.postdata.createPost(this.userProfile, 'Sans titre').then((success) => {
         this.postid = success.key;
       })
     }

     //Launch the pick and crop tool
    (<any>window).InstagramAssetsPicker.getMedia(
      (result)=> {
        this.loading = this.loadingCtrl.create({
          spinner: 'crescent',
          content: 'Traitement...'
        });

        this.loading.present();
        this.cropAsset(result, image);
      },
      function(err) { // error cb
        console.log('getMedia error, err: ', err);
      },
      { // options
        cropAfterSelect: false, // see the note above for when this is false - defaults to false
        showGrid: true // determines whether to show the grid for cropping - defaults to false
      }
    );
  }

  cropAsset(cropData, image) {
    this.uploading = true;
    setTimeout(() => {
      (<any>window).InstagramAssetsPicker.cropAsset(
        (result) => {
          //Success
          //Launch the upload function
          if(image){
            this.updatePhoto(result.filePath, image);
          }
          else {
            this.usePhoto(result.filePath);
          }
        },
        (err) => {
          console.log('InstagramAssetsPicker cropAsset error, err: ', err);
        },
        cropData // contains { filePath : uriObj, rect: rectObj }
      );
    });
  }

  usePhoto(data){
    this.loading.dismiss();
    var guid = this.guidGenerator();
    //Define the locations used to edit the Firebase data
    var fireStorRef = firebase.storage().ref(`/posts/${this.userid}/${this.postid}`);
    var postImagesRef = firebase.database().ref(`/posts/drafts/${this.postid}/images/`);
    var postPicRef = firebase.database().ref(`/posts/drafts/${this.postid}/images/${guid}`);
    var type: any;
    var dir: any;
    var localPath: any;

    //Define the media type and init the dir for future upload
    //Check if photo or video
    if(data.indexOf('mp4') !== -1){
      //is video
      type = 'video';
      localPath = data.replace('file://','');

      //Init the path to the video for the readAsArrayBuffer
      dir = data.substring(0, data.lastIndexOf("/"));
    }
    else {
      //is photo
      type = 'photo';
      localPath = data;

      //Init the path to the photo for the readAsArrayBuffer
      dir = 'file://'+data.substring(0, data.lastIndexOf("/"));
    }

    //Push the image in the local array
    this.post.images.push({
      key: guid,
      position: this.stepsIndex,
      timestamp: new Date().getTime(),
      type: type,
      url: localPath
    });

    //Push the image in Firebase
    //Update the image index to get the position
    firebase.database().ref('/posts/drafts/' + this.postid + '/images/index').once('value').then((snapshot) => {
            this.stepsIndex = snapshot.val() + 1;

      }).then((success) =>{
        //Create the image data node with the local path
        postPicRef.set({
          localUri: data,
          timestamp: new Date().getTime(),
          type: type,
          position: this.stepsIndex
        }).then((success)=>{
          postImagesRef.update({
            index: this.stepsIndex
          })
        });
      })

    //Upload to Firebase\\

    //Init the name of the file for the readAsArrayBuffer
    var n = data.lastIndexOf('/');
    var name = data.substring(n + 1);

    this.cordovaFile.readAsArrayBuffer(dir, name)
      .then((success) =>{
        this.uploading = true;

        if(type=='photo'){
          let blob = new Blob([success], {type: "image/jpg"});
          var uploadTask = fireStorRef.child(guid+'.jpg').put(blob);
        }
        else {
          let blob = new Blob([success], {type: "video/mp4"});
          var uploadTask = fireStorRef.child(guid+'.mp4').put(blob);
        }


        //Progress monitoring
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) =>{
          this.uploading = true;
          var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
          console.log(progress);

        }, function(error) {
          // Handle unsuccessful uploads
        }, () => {
          // Success
          var downloadURL = uploadTask.snapshot.downloadURL;
          postPicRef.update({
              url: downloadURL
            }).then(()=>{
              this.uploading = false;
            })
        });

      })

    this.stepsIndex++;

    this.imagesList = this.post.images;
  }

  updatePhoto(data, image){
    this.loading.dismiss();
    var type:any;
    var dir:any;
    var localPath:any;

    //Define the media type and init the dir for future upload
    //Check if photo or video
    if(data.indexOf('mp4') !== -1){
      //is video
      type = 'video';
      localPath = data.replace('file://','');

      //Init the path to the video for the readAsArrayBuffer
      dir = data.substring(0, data.lastIndexOf("/"));
    }
    else {
      //is photo
      type = 'photo';
      localPath = data;

      //Init the path to the photo for the readAsArrayBuffer
      dir = 'file://'+data.substring(0, data.lastIndexOf("/"));
    }

    //Select the local array with the right position
    var result = this.post.images.filter(function( obj ) {
      return obj.position == image.position;
    });

    //Update this array with a new url, timestamp et type
    result[0].url = localPath;
    result[0].timestamp = new Date().getTime();
    result[0].type = type;

    //Now update the right firebase node
    var postPicRef = firebase.database().ref(`/posts/drafts/${this.postid}/images/${image.key}`);
    postPicRef.update({
        localUri: localPath,
        timestamp: new Date().getTime(),
        type: type
      });

    //Upload to Firebase\\

    var fireStorRef = firebase.storage().ref(`/posts/${this.userid}/${this.postid}`);
    //Init the name of the file for the readAsArrayBuffer
    var n = data.lastIndexOf('/');
    var name = data.substring(n + 1);

    this.cordovaFile.readAsArrayBuffer(dir, name)
      .then((success) =>{
        this.uploading = true;

        if(type=='photo'){
          let blob = new Blob([success], {type: "image/jpg"});
          var uploadTask = fireStorRef.child(image.key+'.jpg').put(blob);
        }
        else {
          let blob = new Blob([success], {type: "video/mp4"});
          var uploadTask = fireStorRef.child(image.key+'.mp4').put(blob);
        }


        //Progress monitoring
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) =>{
          this.uploading = true;
          var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
          console.log(progress);

        }, function(error) {
          // Handle unsuccessful uploads
        }, () => {
          // Success
          var downloadURL = uploadTask.snapshot.downloadURL;
          postPicRef.update({
              url: downloadURL
            }).then(()=>{
              this.uploading = false;
            })
        });

      })

      this.imagesList = this.post.images;
  }

  //Update the text of a step
  changeFunction(key, type){

    this.uploading = true;

    if(!this.postForm.valid){
      }
    else {

      var text = this.postForm.value.post;
      var title = this.postForm.value.title;

      //If we're sending a title
      if(type=='title'){

        //If the local post doesn't exist
        if(this.post == false){
          this.post = this.postdata.createLocalPost(this.userProfile);
          this.post.title = title;
          this.title = title;
        }
        else {
          this.post.title = title;
          this.title = title;
        }

        //Check if the post is created in Firebase
        if(this.postid == false){
          this.creating = true;
            //If not, create it with the title
            var firepost = this.postdata.createPost(this.userProfile, title).then((success) => {
            this.postid = success.key;
             this.creating = false;
             this.uploading = false;
          })
        }
        else {
          //If the post already exists in Firebase, update its title
          var postRef = firebase.database().ref(`/posts/drafts/${this.postid}/`);
          postRef.update({
            title: title
          }).then(() => {
            this.uploading = false;
          });
        }

      }
      //If it's an explanation
      else {
        //Select the image object with the right key
        var image = this.post.images.filter(function( obj ) {
          return obj.key == key;
        });
        //Put the text value in the image
        image[0].text = text;

        //Update the right firebase node with the text
        var postImagesRef = firebase.database().ref(`/posts/drafts/${this.postid}/images/${key}`);
        postImagesRef.update({
          explanation: text
        }).then(() => {
          this.uploading = false;
        });
      }


    }
  }

  toDrafts() {
      let modal = this.modalCtrl.create(DraftsPage, {showCloseBtn: true});

      //Handle the come back with a recipe
      modal.onDidDismiss(data => {

          if(data.nochoice !== true){
            var loading = this.loadingCtrl.create({
              spinner: 'crescent',
              content: 'Building recipe...'
            });
            loading.present();

            var localPost = this.postdata.firebaseToLocal(data.post);
            this.post = localPost;

            this.postid = this.post.key;
            this.title = this.post.title;

            this.imagesList = this.post.images;

            //Call a change detection to prevent ExpressionChangedAfterItHasBeenCheckedError
            this.cdRef.detectChanges();

            setTimeout(()=>{ loading.dismiss() }, 1500);
          }

      });
      modal.present();
  }

  videoClicked(video) {
    video.play();
    video.muted= true;
  }

  guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  photoAction(image){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Change image',
      buttons: [
        {
          text: 'Change this image',
          handler: () => {
            this.photoSelect(image);
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

  checkPost(){
    if(this.postid == false){return true}
    else {return false}
  }

  autosize(textarea) {
      // set default style for textarea
      textarea.style.minHeight  = '0';
      textarea.style.height     = '0';

      // limit size to 96 pixels (6 lines of text)
      var scroll_height = textarea.scrollHeight;

      // apply new style
      textarea.style.minHeight  = scroll_height + "px";
      textarea.style.height     = scroll_height + "px";

      return scroll_height;
  }

  preview(){
    //Go to preview
    //Pass the post and the global modal
    this.navCtrl.push(PreviewPage, {
      postid: this.postid,
      post: this.post,
      viewCtrl: this.navParams.get('viewCtrl')
    });
  }

  dismiss() {
    this.navParams.get('viewCtrl').dismiss({
      nochoice: true
    });
    this.postid = false;
  }
}
