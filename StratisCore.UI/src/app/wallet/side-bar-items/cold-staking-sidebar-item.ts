import { Injectable } from '@angular/core';
import { StakingService } from '@shared/services/staking-service';
import { SideBarItemBase } from '@shared/components/side-bar/side-bar-item-base';

@Injectable()
export class ColdStakingSidebarItem extends SideBarItemBase {
  private isStaking: boolean;

  constructor(private stakingService: StakingService) {
    super('Cold Staking', 'wallet/coldstaking', ['side-bar-item-cold-staking']);
    this.visible = true;
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
    return this.isStaking ? [] : [];
  }
}
