import { Component, OnInit } from '@angular/core';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GetColdStakingInfo } from '@shared/services/interfaces/api.i';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cold-staking',
  templateUrl: './cold-staking.component.html',
  styleUrls: ['./cold-staking.component.scss']
})
export class ColdStakingComponent implements OnInit {

  public coldStakingInfo: Observable<GetColdStakingInfo>;
  public isHot: boolean;
  public isCold: boolean;

  constructor(public coldStakingService: ColdStakingService) { }

  ngOnInit(): void {
    this.coldStakingInfo = this.coldStakingService.coldStakingInfo();
    this.coldStakingInfo.subscribe(response => {
      this.isHot = response.hotWalletAccountExists;
      this.isCold = response.coldWalletAccountExists;
    })
  }
}
