import { Component, OnInit } from '@angular/core';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.scss'],
  animations: Animations.fadeIn
})
export class StakingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
