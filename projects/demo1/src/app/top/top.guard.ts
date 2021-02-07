import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { Data, generateDatasAtRandom } from '../data';
import { DataProviderImplAsc } from '../data-provider';
import { generateGroupsAtRandom, Group } from '../group';
import { GroupProviderServiceImplDesc } from '../group-provider.service';

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
      6,
      [
        DataProviderImplAsc.store,
        GroupProviderServiceImplDesc.store,
      ],
    );
    await this.dataStoreIdx.clearAll();
    const groups = generateGroupsAtRandom(5);
    const datas: Array<Data> = [];
    groups.forEach(group => {
      datas.push(...generateDatasAtRandom(group.id, 1000));
    });
    const providerGroups = new GroupProviderServiceImplDesc(this.dataStoreIdx);
    const providerDatas = new DataProviderImplAsc(this.dataStoreIdx);
    providerGroups.add(...groups);
    providerDatas.add(...datas);
    return true;
  }
}
