import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app-routing.module';

import { AppComponent } from './app.component';
import { CounterComponent } from './counter/counter.component';
import {InputToValuePipe} from './input-to-value.pipe';
import { ToArrayPipe } from './to-array.pipe';
import { CounterViewComponent } from './counter/counter-view/counter-view.component';

@NgModule({
  declarations: [
    AppComponent,
    CounterComponent,
    ToArrayPipe,
    InputToValuePipe,
    CounterViewComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(APP_ROUTES),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
