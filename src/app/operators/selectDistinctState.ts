import { Observable, pipe, UnaryFunction } from 'rxjs';
import { distinctUntilChanged, pluck } from 'rxjs/operators';

export function selectDistinctState<T, I>(key: string): UnaryFunction<Observable<T>, Observable<I>> {
  return  pipe(
    pluck<T, I>(key),
    distinctUntilChanged<I>()
  );
}
