import { Component, OnInit } from '@angular/core';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'app-cold-staking',
  templateUrl: './cold-staking.component.html',
  styleUrls: ['./cold-staking.component.scss'],
  animations: Animations.fadeIn
})
export class ColdStakingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
