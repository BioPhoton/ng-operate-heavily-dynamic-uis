import {Routes} from '@angular/router';
import {CounterComponent} from './counter/counter.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CounterComponent
  }
];
