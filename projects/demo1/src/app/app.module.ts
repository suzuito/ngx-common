import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgxMugenScrollModule } from 'ngx-mugen-scroll';
import { Demo1Component } from './demo1/demo1.component';
import { TopComponent } from './top/top.component';
import { Demo2Component } from './demo2/demo2.component';
import { LoggerComponent } from './logger/logger.component';
import { Debug1Component } from './debug1/debug1.component';

@NgModule({
  declarations: [
    AppComponent,
    Demo1Component,
    TopComponent,
    Demo2Component,
    LoggerComponent,
    Debug1Component,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxMugenScrollModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
