import { MenuController } from 'ionic-angular/index';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
//import { TabsPage } from '../pages/tabs/tabs';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

//Pages Imported
import { Login } from '../pages/auth/login/login';
import { HomePage } from '../pages/home/home';
import { IndexPage } from '../pages/index/index';
import { SettingsPage } from '../pages/details/settings/settings';
import { SearchPage } from '../pages/actions/search-page/search-page';
import { ProfilePage } from '../pages/profile/profile';
import { TabsPage } from '../pages/tabs/tabs';
import { WaitlistPage } from '../pages/waitlist/waitlist';
import { ProfileData } from '../providers/profile-data';

import * as firebase from 'firebase/app';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;
  userProfile: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, db: AngularFireDatabase, afAuth: AngularFireAuth, keyboard: Keyboard, 
    private menuCtrl: MenuController, public profileData: ProfileData) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      keyboard.hideKeyboardAccessoryBar(false);
      statusBar.styleDefault();
      statusBar.overlaysWebView(false);
      splashScreen.hide();
      menuCtrl.swipeEnable(false);
    });
    afAuth.authState.subscribe( user => {
      if (user) {

        //=== WAITLIST CHECK ===
        var whitelisted: any;
        firebase.database().ref('/users/'+user.uid).once('value', (snapshot) => {
            whitelisted = snapshot.val().whitelisted;

            if(whitelisted == true){
               console.log(whitelisted)
                this.rootPage = TabsPage;
             }
             else {
               console.log(whitelisted)
                this.rootPage = WaitlistPage;
             }
        })
        //=== END OF WAITLIST CHECK ===

      } else {
        this.rootPage = IndexPage;
      }
    });

  }
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
