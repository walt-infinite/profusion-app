import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { Notifications } from '../notifications/notifications';
import { ProfilePage } from '../profile/profile';
import { YouPage } from '../you/you';
import { PostPage } from '../details/post-page/post-page';

import { NavController,ModalController,AlertController  } from 'ionic-angular';
import {CreateContainerPage} from '../create-container/create-container';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = Notifications;
  tab3Root: any = YouPage;

  constructor(public modalCtrl: ModalController, public navCtrl: NavController) {

  }

  createPost(){
    let modal = this.modalCtrl.create(CreateContainerPage, {
      post: "",
      posting: true,
      commenting: false
    });

    modal.onDidDismiss(data => {
      if(!data.nochoice){
        this.navCtrl.setRoot(TabsPage); 
      }
    });


    modal.present();
  }
}
