import { Injectable } from '@angular/core';
import { SideBarItemBase } from '@shared/components/side-bar/side-bar-item-base';
import { GlobalService } from '@shared/services/global.service';

@Injectable({
  providedIn: 'root'
})
export class SendSidebarItem extends SideBarItemBase {
  constructor(private globalService: GlobalService) {
    super('Send', '/wallet/send', ['side-bar-item-send']);

    this.globalService.isWatchOnly().subscribe(boolean => {
      this.visible = !boolean;
    });

    if (this.visible == null) {
      this.visible = true;
    }
  }

  displayText: string;
  order: number;
  route: string;
  selected: boolean;
  visible: boolean;

  protected getStatusClasses(): string[] {
    return [];
  }
}
