import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GamePage } from './game.page';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MemoryAlertComponent } from '../modal/memory-alert/memory-alert.component';

const routes: Routes = [
  {
    path: '',
    component: GamePage,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
  ],
  declarations: [GamePage, MemoryAlertComponent],
})
export class GamePageModule {}
