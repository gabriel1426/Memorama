import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
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
  declarations: [HomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageModule {}
