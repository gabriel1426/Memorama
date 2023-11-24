import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PictureModel } from '../core/models/picture.model';
import { Colors } from './colors/colors.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { NativeAudio } from '@capacitor-community/native-audio';
import { MemoryAlertComponent } from '../modal/memory-alert/memory-alert.component';
import { CategoryModel } from '../core/models/category.model';
import { MenuEnum } from '../core/menu.enum';
import { PlayersEnum } from './colors/players.enum';
import { Subscription } from 'rxjs';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {
  private minutes = 0;
  private seconds = 0;
  private validId: string[] = [];
  private category: CategoryModel;

  private timeout: any;
  private timerInterval: any;

  private isShowAlert = false;

  public timer = '00:00';
  public showFooter = false;
  public players = '1';
  public pictures: PictureModel[] = [];
  public movements = 0;
  public finishMessage = '';
  public hasFinishedGame = false;
  public isMute = false;

  public lastItem: PictureModel | null;
  public lastElement: any;

  public pointsPlayer1 = 0;
  public pointsPlayer2 = 0;
  public turn: string;

  private backSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer,
    private platform: Platform,
    private storage: Storage,
    private modalController: ModalController
  ) {}

  async ionViewDidEnter() {
    await StatusBar.setBackgroundColor({ color: '#00B2AA' });
    this.backSubscription = this.platform.backButton.subscribeWithPriority(
      0,
      () => {
        if (!this.isShowAlert) {
          this.showAlert(MenuEnum.exit);
        }
      }
    );
  }

  ngOnDestroy() {
    this.backSubscription.unsubscribe();
  }

  get MenuEnum() {
    return MenuEnum;
  }

  get PlayersEnum() {
    return PlayersEnum;
  }

  async ngOnInit() {
    await this.storage.create();
    this.setVolume();
    this.route.queryParams.subscribe((params) => {
      this.players = params['players'];
      this.showFooter = this.players === '2';
      this.category = JSON.parse(params['category']);
      this.startGame();
    });
  }

  private async setVolume() {
    this.isMute = (await this.storage.get('volume')) || false;
  }

  private startGame() {
    this.getCategory(this.category.id);
    this.setInterval();
  }

  private setInterval(): void {
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  getCategory(id: string) {
    let images = this.translateService.instant(id) || [];
    const color = this.shuffleArray(Colors);
    images = this.shuffleArray(images);
    images.slice(0, 15).forEach((item: PictureModel, index: number) => {
      item.color = color[index];
      this.pictures.push(item, item);
    });
    this.pictures = this.shuffleArray(this.pictures);
  }

  shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  updateTimer() {
    this.seconds++;
    if (this.seconds === 60) {
      this.minutes++;
      this.seconds = 0;
    }

    const formattedMinutes = this.minutes.toString().padStart(2, '0');
    const formattedSeconds = this.seconds.toString().padStart(2, '0');

    this.timer = `${formattedMinutes}:${formattedSeconds}`;
  }

  async validate(event: Event, item: PictureModel): Promise<void> {
    if (
      this.validId.includes(item.id) ||
      event.target === this.lastElement ||
      this.timeout
    ) {
      return;
    }
    if (!this.turn) {
      this.turn = PlayersEnum.Player1;
    }

    if (!this.lastItem) {
      await this.playSound('open-card');
      this.lastItem = item;
      this.lastElement = event.target as HTMLElement;
      this.flip(this.lastElement);
      return;
    }

    if (this.lastItem.id === item.id) {
      this.validId.push(item.id);
      this.setPoints();
      if (this.validId.length === 15) {
        await this.finishGame();
      } else {
        this.timeout = setTimeout(() => {
          this.chanceTurn();
          this.timeout = null;
        }, 700);
        await this.playSound('win');
      }
    } else {
      await this.playSound('open-card');
      this.timeout = setTimeout(() => {
        this.flip(this.lastElement);
        this.flip(event.target);
        this.lastElement = null;
        this.timeout = null;
        this.chanceTurn();
      }, 700);
    }

    this.lastItem = null;
    this.flip(event.target);
    this.movements++;
  }

  private chanceTurn() {
    this.turn =
      this.turn === PlayersEnum.Player1
        ? PlayersEnum.Player2
        : PlayersEnum.Player1;
  }

  private async playSound(id: string) {
    if (!this.platform.is('capacitor')) {
      const audio = new Audio(`assets/sounds/${id}.wav`);
      audio.currentTime = 0;
      !this.isMute ? await audio.play() : () => {};
      return;
    }

    await NativeAudio.play({ assetId: id });
  }

  private flip(element: any) {
    element.classList.toggle('is-flipped');
  }

  private setPoints(): void {
    if (this.players !== '2') {
      return;
    }

    this.turn === PlayersEnum.Player1
      ? (this.pointsPlayer1 += 5)
      : (this.pointsPlayer2 += 5);
  }

  private async finishGame(): Promise<void> {
    await this.playSound('finish');
    clearInterval(this.timerInterval);

    this.hasFinishedGame = true;

    if (this.players === '1') {
      const currentTime = new Date();
      currentTime.setMinutes(this.minutes);
      currentTime.setSeconds(this.seconds);

      const storageTime = JSON.parse(await this.storage.get(this.category.id));
      const saveTime = new Date();
      saveTime.setMinutes(storageTime?.minutes || 60);
      saveTime.setSeconds(storageTime?.seconds || 60);

      this.showFooter = true;
      if (storageTime || currentTime < saveTime) {
        this.finishMessage = this.translateService.instant('wonderful');
        const data = {
          minutes: this.minutes,
          seconds: this.seconds,
        };
        await this.storage.set(this.category.id, JSON.stringify(data));
        return;
      }
      this.finishMessage = this.translateService.instant('greatJob');
    } else {
      setTimeout(() => {
        this.showWinner();
      }, 500);
    }
  }

  showWinner() {
    const winner = this.pointsPlayer1 > this.pointsPlayer2 ? '1' : '2';
    this.showAlert(MenuEnum.winner, winner);
  }

  async mute(): Promise<void> {
    if (!this.platform.is('capacitor')) {
      this.isMute = !this.isMute;
      return;
    }
    this.isMute = !this.isMute;
    await this.storage.set('volume', this.isMute);

    const volumen: number = this.isMute ? 0 : 1;
    await NativeAudio.setVolume({ assetId: 'open-card', volume: volumen });
    await NativeAudio.setVolume({ assetId: 'win', volume: volumen });
    await NativeAudio.setVolume({ assetId: 'finish', volume: volumen });
    await NativeAudio.setVolume({ assetId: 'start', volume: volumen });
  }

  goToHome(): void {
    this.router.navigate(['home'], { replaceUrl: true });
  }

  resetGame(): void {
    this.showFooter = this.players === '2';
    this.pictures = [];
    this.lastItem = null;
    this.lastElement = null;
    this.timer = '00:00';
    this.seconds = 0;
    this.minutes = 0;
    this.movements = 0;
    this.finishMessage = '';
    this.validId = [];
    this.pointsPlayer2 = 0;
    this.pointsPlayer1 = 0;
    this.turn = PlayersEnum.Player1;
    this.hasFinishedGame = false;
    clearInterval(this.timerInterval);
    this.startGame();
    this.startPosition();
  }

  startPosition() {
    const contenedor = document.getElementById('table');
    const divsHijos = contenedor?.querySelectorAll('div');
    divsHijos?.forEach((item) => {
      item.classList.remove('is-flipped');
    });
  }

  async showAlert(option: MenuEnum, winner?: string) {
    this.isShowAlert = true;
    clearInterval(this.timerInterval);
    const modal = await this.modalController.create({
      component: MemoryAlertComponent,
      componentProps: {
        icon: this.category.icon,
        color: this.category.color,
        winner: winner,
        option: option,
      },
      cssClass: 'alert',
      backdropDismiss: true,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    this.isShowAlert = false;
    const actions: any = {
      [MenuEnum.reset]: () => {
        data.action ? this.resetGame() : this.setInterval();
      },
      [MenuEnum.exit]: () => {
        data.action ? this.goToHome() : this.setInterval();
      },
      [MenuEnum.winner]: () => {
        data.action ? this.goToHome() : this.resetGame();
      },
    }[option];
    actions();
  }
}
