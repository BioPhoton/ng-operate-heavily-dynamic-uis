import {Component, OnDestroy} from '@angular/core';
import {merge, NEVER, Subject, timer} from 'rxjs';
import {map, mapTo, switchMap, takeUntil, tap, withLatestFrom} from 'rxjs/operators';
import {CounterState} from '../counter-state.interface';
import {ElementIds} from '../element-ids.enum';
import {INITIAL_COUNTER_STATE} from '../initial-counter-state';
import {inputToValue} from '../operators/inputToValue';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnDestroy {

  // = CONSTANTS ============================================================
  elementIds = ElementIds;
  initialCounterState: CounterState = INITIAL_COUNTER_STATE;
  ngOnDestroySubject = new Subject();

  // = BASE OBSERVABLES  ====================================================
  // == SOURCE OBSERVABLES ==================================================
  // === STATE OBSERVABLES ==================================================
  // === INTERACTION OBSERVABLES ============================================
  btnStart: Subject<Event> = new Subject<Event>();
  btnPause: Subject<Event> = new Subject<Event>();
  btnSetTo: Subject<Event> = new Subject<Event>();
  inputSetTo: Subject<number> = new Subject<number>();

  // == INTERMEDIATE OBSERVABLES ============================================
  lastSetToFromButtonClick = this.btnSetTo
    .pipe(
      withLatestFrom(
        this.inputSetTo.pipe(inputToValue()),
        (btnSetTo, inputSetTo) => {
          return inputSetTo;
        }));

  // = SIDE EFFECTS =========================================================
  count = 0;
  updateCounterFromTick = merge(
    this.btnStart.pipe(mapTo(true)),
    this.btnPause.pipe(mapTo(false))
  )
    .pipe(
      switchMap((isTicking) => {
        return isTicking ? timer(0, this.initialCounterState.tickSpeed) : NEVER;
      }),
      tap((_) => {
        this.count = this.count + this.initialCounterState.countDiff;
      })
    );

  setCountFromSetToClick = this.lastSetToFromButtonClick.pipe(
    tap((next) => {
      this.count = next;
    })
  );

  constructor() {
    // = SUBSCRIPTION =========================================================
    merge(
      this.updateCounterFromTick,
      this.setCountFromSetToClick
    )
      .pipe(
        takeUntil(
          this.ngOnDestroySubject.asObservable()
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.ngOnDestroySubject.next(true);
  }

}
