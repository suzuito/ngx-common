import { NgModule } from '@angular/core';
import { NgxMugenScrollComponent } from './ngx-mugen-scroll.component';
import { MugenScrollTopDirective } from './mugen-scroll-top.directive';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';



@NgModule({
  declarations: [
    NgxMugenScrollComponent,
    MugenScrollTopDirective,
    MugenScrollBottomDirective,
    MugenScrollDataDirective,
  ],
  imports: [
  ],
  exports: [
    NgxMugenScrollComponent,
    MugenScrollTopDirective,
    MugenScrollBottomDirective,
    MugenScrollDataDirective,
  ],
})
export class NgxMugenScrollModule { }
