import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CategoryModel } from '../core/models/category.model';
import { Router } from '@angular/router';
import { NativeAudio } from '@capacitor-community/native-audio';
import { Storage } from '@ionic/storage-angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public players = 1;
  public categories: CategoryModel[] = [];
  public record = '';
  private realIndex = 0;

  constructor(
    private translateService: TranslateService,
    private storage: Storage,
    private router: Router
  ) {}

  async ngOnInit() {
    this.categories = this.translateService.instant('categories');
    await this.storage.create();
  }

  async ionViewDidEnter() {
    await StatusBar.setBackgroundColor({ color: '#005961' });
    await SplashScreen.hide();
    this.getCategoryTime(this.categories[this.realIndex].id);
    this.listenSlides();
  }

  listenSlides() {
    const swiperEl = document.querySelector('swiper-container');
    swiperEl?.addEventListener('swiper-slidechange', async (event) => {
      const [swiper] = (event as any).detail;
      this.realIndex = swiper['realIndex'];
      const id = this.categories[this.realIndex].id;
      await this.getCategoryTime(id);
    });
  }

  async getCategoryTime(id: string) {
    const time = JSON.parse(await this.storage.get(id));
    if (time) {
      this.record = `${time.minutes > 9 ? time.minutes : '0' + time.minutes}:${
        time.seconds > 9 ? time.seconds : '0' + time.seconds
      }`;
      return;
    }

    this.record = '';
  }

  goToGame(category: CategoryModel): void {
    NativeAudio.play({ assetId: 'start' });
    this.router.navigate(['game'], {
      queryParams: {
        category: JSON.stringify(category),
        players: this.players,
      },
    });
  }
}
