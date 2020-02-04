import { Component, OnInit } from '@angular/core';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GetColdStakingInfo } from '@shared/services/interfaces/api.i';
import { Observable } from 'rxjs';
import { DeploymentInfo } from '@shared/models/deployment-info';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateSelectComponent } from './create-select/create-select.component';
import { WithdrawColdFundsComponent } from './withdraw-cold-funds/withdraw-cold-funds.component';

@Component({
  selector: 'app-cold-staking',
  templateUrl: './cold-staking.component.html',
  styleUrls: ['./cold-staking.component.scss']
})
export class ColdStakingComponent implements OnInit {

  public coldStakingInfo: Observable<GetColdStakingInfo>;
  public coldStakingDeploymentInfo: Observable<DeploymentInfo>;

  constructor(public coldStakingService: ColdStakingService, public modalService: NgbModal) { }

  ngOnInit(): void {
    this.coldStakingInfo = this.coldStakingService.coldStakingInfo();
    this.coldStakingDeploymentInfo = this.coldStakingService.coldStakingDeploymentInfo();
  }

  onSetup(): void {
    this.modalService.open(CreateSelectComponent, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  withdrawClicked(): void {
    this.modalService.open(WithdrawColdFundsComponent, {
      backdrop: 'static',
      size: 'lg'
    });
  }
}
