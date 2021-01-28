import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { Data } from '../data';
import { DataProviderImplAsc, generateTestDatas } from '../data-provider';
import { randomIds } from './random-ids';

@Injectable({
  providedIn: 'root'
})
export class TopGuard implements CanActivate {
  constructor(
    private dataStoreIdx: OrderedDataStoreIdxService,
  ) {
  }
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    await this.dataStoreIdx.initDB(
      2,
      [
        DataProviderImplAsc.store,
      ],
    );
    await generateTestDatas(this.dataStoreIdx);
    return true;
  }
}
