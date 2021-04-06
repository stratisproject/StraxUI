import { Injectable } from '@angular/core';
import { SideBarItemBase } from '@shared/components/side-bar/side-bar-item-base';
import { GlobalService } from '@shared/services/global.service';

@Injectable()
export class ContactsSidebarItem extends SideBarItemBase {
  constructor(private globalService: GlobalService) {
    super('Contacts', '/wallet/address-book', ['side-bar-item-address']);

    this.globalService.isWatchOnly().subscribe(boolean => {
      this.visible = !boolean;
    })

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
