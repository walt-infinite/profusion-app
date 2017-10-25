import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import 'rxjs/add/operator/map';
import 'rxjs/Rx';

import * as firebase from 'firebase/app';

@Injectable()
export class PostData {
  //Date timer
  today = new Date().getTime();
  //Vars
  profileData: any;
  userProfile: any;
  currentUser: any;
  userid: any;
  postlist: any;
  data: any;
  error: any;

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    this.userid = firebase.auth().currentUser.uid; 
    this.userProfile = firebase.database().ref('/users/');
  }
  createPost(user, post){
    let channelItem = this.db.list('/posts/drafts');

    var postId = channelItem.push({
        title: post,
        timestamp: this.today,
        userid: user.userid,
        name: user.name,
        profilepic: user.profilepic,
        likes: 0,
        comments_count: 0,
        type: 'post',
        status: 'draft'
      });

     return postId;
  }

  createLocalPost(user){
    var post = {
      title: 'Untitled',
      timestamp: this.today,
      userid: user.userid,
      name: user.name,
      profilepic: user.profilepic,
      likes: 0,
      comments_count: 0,
      type: 'post',
      status: 'draft',
      images: []
    }

    return post;

  }

  firebaseToLocal(post){
    var images = [];

    for (var key in post.images) {
      if (post.images.hasOwnProperty(key)) {
        if(key != "index"){
          post.images[key].key = key;
          images.push(post.images[key]);
        }
      }
    }

    //Sort the array by position
    images.sort(this.sortFunction);

    var localpost = {
      title: post.title,
      key: post.key,
      images: images
    }

    return localpost;
  }

  sortFunction(a,b){
    if (a.position < b.position)
      return -1;
    if (a.position > b.position)
      return 1;
    return 0;
  }

  createComment(postRef, user, post){
    let channelItem = this.db.list(`/comments/${postRef.key}/`);
    let postList = firebase.database().ref(`/posts/publish/${postRef.key}`);
    let notifyUserRef = firebase.database().ref(`/notifications/${postRef.userid}`); 

    channelItem.push({
      postid: postRef.key,
      timestamp: this.today,
      userid: user.userid,
      post: post,
      name: user.name,
      profilepic: user.profilepic,
      likes: 0,
      type: 'comment',
    }).then(_=> {
      if(postRef.userid != this.userid){
          console.log('hello');

          notifyUserRef.push({
            senderName: user.name,
            senderProfilepic: user.profilepic,
            postid: postRef.key,
            userid: user.userid,
            timestamp: this.today,
            post: post,
            type: "comment",
            notification: true
          })
         }
       });



    postList.child(`comments_count`).transaction(function(post) {
      post += 1;
      return post;
    });
  }
  //Like a Post
  upVotePost(post, userInfo) {
    let postList = firebase.database().ref(`/posts/publish/${post.key}`);
    let postsUserRef = firebase.database().ref(`/likes/${post.key}/${this.userid}`);
    let notifyUserRef = firebase.database().ref(`/notifications/${post.userid}`); 

    postList.child(`likes`).transaction(function(post) {
      post += 1;
      return post;
    }).then(_=> {
      postsUserRef.set({
          userid: this.userid,
          type: "post",
          action: "liked"
        }).then(_=> {
          //Check if the sender isn't the receiver
          if(post.userid != this.userid){
            console.log('hello');
            //Check if the notification doesn't exist yet
            let notifsList = firebase.database().ref(`/notifications`); 
            notifsList.orderByChild('voted').equalTo('liked').once("value")
              .then((snapshot) => {
                let myId = this.userid;
                var postCheck = snapshot.hasChild(`${myId}`);
                  //Check if UserId is On the List
                  if (!postCheck) {
                    //Create notif
                    notifyUserRef.push({
                      likedName: userInfo.name,
                      likedProfilepic: userInfo.profilepic,
                      postid: post.key,
                      userid: userInfo.userid,
                      timestamp: this.today,
                      voted: "liked",
                      type: "post",
                      title: post.title,
                      notification: true
                    })
                  }
              });
            }
        })
    })
  }

  //Unlike a Post
  unVotePost(post, userInfo) {
    //Get list of likers
    let myId = this.userid;
    let postList = firebase.database().ref(`/posts/publish/${post.key}`);
    let postLike = firebase.database().ref(`/likes/${post.key}/${myId}`); 

    postList.child(`likes`).transaction(function(post) {
      post -= 1;
      return post;
    });
      //Remove the node
      return postLike.remove();
  }


  //Disike a Post
  downVotePost(post, userInfo) {
    let postList = firebase.database().ref(`/posts/${post.key}`);
    let postsUserRef = firebase.database().ref(`/posts/${post.key}/likers/${this.userid}`);
    let notifyUserRef = firebase.database().ref(`/notifications/${post.userid}`); 

    postList.child(`likes`).transaction(function(post) {
      post -= 1;
      return post;
    }).then(_=> {
        postsUserRef.set({
          userid: this.userid,
          type: "post",
          action: "disliked"
        }).then(_=> {
          notifyUserRef.push({
            likedName: userInfo.name,
            likedProfilepic: userInfo.profilepic,
            postid: post.$key,
            userid: userInfo.userid,
            timestamp: this.today,
            post: post.post,
            voted: "disliked",
            type: "post",
            notification: true
          })
        })    
     })    
  }
  //Like a Comment
  upVoteComment(comment, postRef, userInfo) {
    let commentList = firebase.database().ref(`/posts/${postRef}/comments/${comment.$key}/`);
    let commentsUserRef = firebase.database().ref(`/posts/${postRef}/comments/${comment.$key}/likers/${this.userid}`);
    let notifyUserRef = firebase.database().ref(`/users/${this.userid}/notifications/${comment.$key}`); 

    commentList.child(`likes`).transaction(function(comment) {
      comment += 1;
      return comment;
    }).then(_=> {
        commentsUserRef.set({
          userid: this.userid,
          type: "comment",
          action: "liked"
        }).then(_=> {
          notifyUserRef.set({
            likedName: userInfo.name,
            likedProfilepic: userInfo.profilepic,
            postid: postRef,
            userid: userInfo.userid,
            timestamp: this.today,
            post: comment.post,
            voted: "liked",
            type: "commentlike",
            notification: true
          })
        })    
     })    
  }
  //Like a Comment
  downVoteComment(comment, postRef, userInfo) {
    let commentList = firebase.database().ref(`/posts/${postRef}/comments/${comment.$key}/`);
    let commentsUserRef = firebase.database().ref(`/posts/${postRef}/comments/${comment.$key}/likers/${this.userid}`);
    let notifyUserRef = firebase.database().ref(`/users/${this.userid}/notifications/${comment.$key}`); 

    commentList.child(`likes`).transaction(function(comment) {
      comment -= 1;
      return comment;
    }).then(_=> {
        commentsUserRef.set({
          userid: this.userid,
          type: "comment",
          action: "disliked"
        }).then(_=> {
          notifyUserRef.set({
            likedName: userInfo.name,
            likedProfilepic: userInfo.profilepic,
            postid: postRef,
            userid: userInfo.userid,
            timestamp: this.today,
            post: comment.post,
            voted: "disliked",
            type: "commentlike",
            notification: true
          })
        })    
     })    
  }
  deleteComment(comment, postRef) {
    let commentItem = firebase.database().ref(`/posts/${comment.postid}/comments/${comment.$key}`);
    let NotifyUserRef = firebase.database().ref(`/users/${comment.userid}/notifications/${comment.$key}`);
    if (comment.userid == this.userid) {
      commentItem.remove();
      NotifyUserRef.remove();
    } else {
      console.log("Common dude, delete your own posts");
    }
  }

  snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach((childSnapshot) => {
        var item = childSnapshot.val();
        if(isNaN(parseFloat(item)) && !isFinite(item)){
          item.key = childSnapshot.key;

        let myId = this.userid;
        let postLikersList = firebase.database().ref(`/likes/${item.key}`); 

        //Query Post Likers List for User Key 
        postLikersList.once("value")
          .then((snapshot) => {
          var postCheck = snapshot.hasChild(`${myId}`);
            //Check if UserId is On the List
            if (!postCheck) {
              item.islikedPost = false;
            } else {
              item.islikedPost = true;
            }
          });

        returnArr.push(item);
        }
    });

    return returnArr;
  };
}
