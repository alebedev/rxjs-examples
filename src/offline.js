import {Subject} from 'rxjs/Subject';

// Declaration
const data$ = new Subject();
let initialized = false;
export function getData() {
    let promise = Promise.resolve();
    if (!initialized) {
        promise = getDataFromCache()
            .then((data) => {
                if (data) {
                    data$.next(data);
                }
            });
    }
    loadDataFromServer().then((data) => data$.next(data));
    return data$;
}

// Usage
getData().subscribe({
    next(data) {
        updateUi(data);
    },
    error(err) {
        handleError(err);
    }
});