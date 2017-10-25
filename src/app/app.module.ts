import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { Keyboard } from '@ionic-native/keyboard';

import { Notifications } from '../pages/notifications/notifications';
import { ProfilePage } from '../pages/profile/profile';
import { YouPage } from '../pages/you/you';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';
import { File } from '@ionic-native/file';
import { VideoEditor } from '@ionic-native/video-editor';
import { ImageResizer } from '@ionic-native/image-resizer';

import { ElasticModule } from 'ng-elastic';

//Action Pages
import { CreateContainerPage } from '../pages/create-container/create-container';
import { CreateContainerPageModule } from '../pages/create-container/create-container.module';

//Detail Pages
import { PostPage } from '../pages/details/post-page/post-page';
import { DraftsPage } from '../pages/drafts/drafts';
import { SettingsPage } from '../pages/details/settings/settings';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';

import { OrganizePage } from '../pages/organize/organize';
import { OrganizePageModule } from '../pages/organize/organize.module';
import { PreviewPageModule } from '../pages/preview/preview.module';
import { WaitlistPageModule } from '../pages/waitlist/waitlist.module';

//Auth Pages
import { Login } from '../pages/auth/login/login';
import { ResetPassword } from '../pages/auth/reset-password/reset-password';
import { Signup } from '../pages/auth/signup/signup';
import { IndexPage } from '../pages/index/index';

//Providers
import { AuthData } from '../providers/auth-data';
import { PostData } from '../providers/post-data';
import { ProfileData } from '../providers/profile-data';

//Pipes
import { TimeStamp } from '../pipes/time-stamp';

// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';

// AF2 Settings
export const firebaseConfig = {
    apiKey: "AIzaSyBlh8NIpsdKI9zAXVaVqHKyoCb8Sz_s71w",
    authDomain: "profusion-960e3.firebaseapp.com",
    databaseURL: "https://profusion-960e3.firebaseio.com",
    projectId: "profusion-960e3",
    storageBucket: "profusion-960e3.appspot.com",
    messagingSenderId: "178607507087"
};

@NgModule({
  declarations: [
    MyApp,
    ProfilePage,
    HomePage,
    Notifications,
    Login,
    ResetPassword,
    Signup,
    SettingsPage,
    PostPage,
    TabsPage,
    IndexPage,
    TimeStamp,
    YouPage,
    DraftsPage,
    EditProfilePage,
    //OrganizePage,
    //CreateContainerPage,
    //PreviewPage,
    //WaitlistPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ElasticModule,
    IonicModule.forRoot(MyApp,({
      iconMode: 'md',
      pageTransition: 'ios-transition',
      platforms: {
        ios: {
          statusbarPadding: false,
        }
      }
    })),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    CreateContainerPageModule,
    OrganizePageModule,
    PreviewPageModule,
    WaitlistPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProfilePage,
    HomePage,
    Notifications,
    Login,
    ResetPassword,
    Signup,
    SettingsPage,
    PostPage,
    IndexPage,
    TabsPage,
    YouPage,
    DraftsPage,
    EditProfilePage,
    //OrganizePage,
    //CreateContainerPage,
    //PreviewPage,
    //WaitlistPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    MediaCapture,
    ImageResizer,
    File,
    VideoEditor,
    Keyboard,
    {provide: ErrorHandler, useClass: IonicErrorHandler},AuthData,ProfileData,PostData
  ],
})
export class AppModule {}
