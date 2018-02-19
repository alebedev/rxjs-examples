import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';

import {push$, ws$} from './subjects';

const processedIds = new Set();
// Unique notifications
const notifications$ = Observable.merge(push$, ws$)
    .filter(({notificationId}) => !processedIds.has(notificationId))
    .do(({notificationId}) => processedIds.add({notificationId}));


notifications$.subscribe((notification) => {
    // ...
});