import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { NativeAudio } from '@capacitor-community/native-audio';
import { Platform } from '@ionic/angular';
import {
  ScreenOrientation,
  OrientationType,
} from '@capawesome/capacitor-screen-orientation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Storage } from '@ionic/storage-angular';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform, private storage: Storage) {
    this._initializeApp();
  }

  async _initializeApp() {
    await this.platform.ready();
    await StatusBar.setBackgroundColor({ color: '#005961' });
    await StatusBar.setStyle({ style: Style.Dark });
    await ScreenOrientation.lock({ type: OrientationType.PORTRAIT });
    this.setAudios();
  }

  async setAudios() {
    this.platform.ready().then(async () => {
      try {
        const isMute = (await this.storage.get('volume')) || false;
        const volumen: number = isMute ? 0 : 1;

        await NativeAudio.preload({
          assetId: 'open-card',
          assetPath: 'public/assets/sounds/open-card.wav',
          audioChannelNum: 1,
          volume: volumen,
          isUrl: false,
        });

        await NativeAudio.preload({
          assetId: 'win',
          assetPath: 'public/assets/sounds/win.wav',
          audioChannelNum: 1,
          volume: volumen,
          isUrl: false,
        });

        await NativeAudio.preload({
          assetId: 'finish',
          assetPath: 'public/assets/sounds/finish.wav',
          audioChannelNum: 1,
          volume: volumen,
          isUrl: false,
        });

        await NativeAudio.preload({
          assetId: 'start',
          assetPath: 'public/assets/sounds/start.wav',
          audioChannelNum: 1,
          volume: volumen,
          isUrl: false,
        });
      } catch {}
    });
  }
}
