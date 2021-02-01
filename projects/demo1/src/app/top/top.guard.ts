import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { DataProviderImplAsc } from '../data-provider';
import { Group } from '../group';
import { GroupProviderServiceImplAsc } from '../group-provider.service';
import { randomIds } from './random-ids';

export async function generateTestGroups(
  base: OrderedDataStoreIdxService,
  n: number,
): Promise<void> {
  const store = new GroupProviderServiceImplAsc(base);
  for (let i = 0; i < n; i++) {
    await store.add({
      id: `group-${i}`,
      name: `グループ-${i}`,
    });
  }
}

export async function generateTestDatas(
  base: OrderedDataStoreIdxService,
  groupId: string,
): Promise<void> {
  const store = new DataProviderImplAsc(base);
  const now = Date.now() / 1000;
  let i = 0;
  const randomDatas = randomIds.map(v => {
    i++;
    return { id: v, groupId, createdAt: now - (Math.random() * 1000), name: `データ ${i}`, };
  });
  await store.add(
    ...randomDatas,
  );
}


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
    await generateTestDatas(this.dataStoreIdx);
    return true;
  }
}
