import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {CounterFacadeService} from './counter-facade.service';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {

  constructor(public facade: CounterFacadeService) {

  }

}
