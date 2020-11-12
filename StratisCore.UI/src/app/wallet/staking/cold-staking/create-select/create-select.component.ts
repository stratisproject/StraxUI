import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateHotComponent } from '../create-hot/create-hot.component';
import { CreateColdComponent } from '../create-cold/create-cold.component';
import { ColdStakingService } from '@shared/services/cold-staking-service';

@Component({
  selector: 'app-create-select',
  templateUrl: './create-select.component.html',
  styleUrls: ['./create-select.component.scss']
})
export class CreateSelectComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, public coldStakingService: ColdStakingService) { }

  public hasColdStakingAccount;
  public hasHotStakingAccount;
  ngOnInit(): void {
    this.hasColdStakingAccount = this.coldStakingService.getHasColdStakingAccount();
    this.hasHotStakingAccount = this.coldStakingService.getHasHotStakingAccount();
  }

  public openHotStakingCreate(): void {
    this.modalService.open(CreateHotComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    this.activeModal.close();
  }

  public openColdStakingCreate(): void {
    this.modalService.open(CreateColdComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    this.activeModal.close();
  }
}
