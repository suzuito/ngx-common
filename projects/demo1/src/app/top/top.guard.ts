import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { Data, generateDatasAtRandom } from '../data';
import { DataProviderImplAsc } from '../data-provider';
import { generateGroupsAtRandom, Group } from '../group';
import { GroupProviderServiceImplAsc } from '../group-provider.service';

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
    await this.dataStoreIdx.init(
      2,
      [
        DataProviderImplAsc.store,
        GroupProviderServiceImplAsc.store,
      ],
    );
    await this.dataStoreIdx.clearAll();
    const groups = generateGroupsAtRandom(100);
    const datas: Array<Data> = [];
    groups.forEach(group => {
      datas.push(...generateDatasAtRandom(group.id, 100));
    });
    const providerGroups = new GroupProviderServiceImplAsc(this.dataStoreIdx);
    const providerDatas = new DataProviderImplAsc(this.dataStoreIdx);
    providerGroups.add(...groups);
    providerDatas.add(...datas);
    return true;
  }
}
