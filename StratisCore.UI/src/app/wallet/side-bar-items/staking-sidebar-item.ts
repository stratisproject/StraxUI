import { Injectable } from '@angular/core';
import { StakingService } from '@shared/services/staking-service';
import { SideBarItemBase } from '@shared/components/side-bar/side-bar-item-base';
import { GlobalService } from '@shared/services/global.service';

@Injectable()
export class StakingSidebarItem extends SideBarItemBase {
  private isStaking: boolean;

  constructor(private stakingService: StakingService, private globalService: GlobalService) {
    super('Staking', 'wallet/staking', ['side-bar-item-staking']);

    this.globalService.isWatchOnly().subscribe(boolean => {
      this.visible = !boolean;
    });

    if (this.visible == null) {
      this.visible = true;
    }

    if (this.visible) {
      this.subscriptions.push(stakingService.stakingInfo()
        .subscribe(stakingInfo => {
          this.isStaking = stakingInfo && stakingInfo.enabled;
        }));
    }
  }

  displayText: string;
  order: number;
  route: string;
  selected: boolean;
  visible: boolean;

  protected getStatusClasses(): string[] {
    return this.isStaking ? ['side-bar-item-staking-active'] : [];
  }
}
