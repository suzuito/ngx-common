import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Demo1Component } from './demo1/demo1.component';
import { Demo2Component } from './demo2/demo2.component';
import { TopComponent } from './top/top.component';
import { TopGuard } from './top/top.guard';

const routes: Routes = [
  {
    path: '',
    component: TopComponent,
    canActivate: [
      TopGuard,
    ],
    children: [
      {
        path: 'demo1',
        component: Demo1Component,
      },
      {
        path: 'demo2',
        component: Demo2Component,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
