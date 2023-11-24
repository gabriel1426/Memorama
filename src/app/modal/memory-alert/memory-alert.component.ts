import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MenuEnum } from '../../core/menu.enum';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from '../../core/models/alert.model';
import { elementAt } from 'rxjs';

@Component({
  selector: 'app-memory-alert',
  templateUrl: './memory-alert.component.html',
  styleUrls: ['./memory-alert.component.scss'],
})
export class MemoryAlertComponent implements OnInit {
  @Input() color: string;
  @Input() icon: string;
  @Input() option: MenuEnum;
  @Input() winner: string;

  public alert: AlertModel;
  public optionOK: string;
  public optionCancel: string;

  constructor(
    private translateService: TranslateService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    this.alert = {
      [MenuEnum.reset]: (this.alert =
        this.translateService.instant('sureAlert')),
      [MenuEnum.exit]: (this.alert =
        this.translateService.instant('ExitAlert')),
      [MenuEnum.winner]: (this.alert =
        this.translateService.instant('winnerAlert')),
    }[this.option];
  }

  response(answer: boolean): void {
    this.modalCtrl.dismiss({ action: answer });
  }

  protected readonly elementAt = elementAt;
}
