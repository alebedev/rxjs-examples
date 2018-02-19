/*
 * Copyright (c) New Cloud Technologies, Ltd., 2013-2018
 * 
 * You can not use the contents of the file in any way without New Cloud Technologies, Ltd. written permission.
 * To obtain such a permit, you should contact New Cloud Technologies, Ltd. at http://ncloudtech.com/contact.html
 *
 */

// Before

async function createRevision(fileId) {
    return new Promise((resolve, reject) => {
        let requestId;
        restClient.createRevision(fileId).then((resp) => {
            requestId = resp.requestId;
        }).catch((err) => {
            reject(err);
        }).then(() => {
            const successSubscription = Notificaitons.on(EVENTS.FILE_REVISION_ADD, onSuccess);
            const errorSubscription = Notificaitons.on(EVENTS.FILE_REVISION_ADD_ERROR, onError);
            const timeout = setTimeout(onTimeout, SERVER_TIMEOUT);

            function onSuccess(result) {
                if (result.requestId !== requestId) return;

                cancelTimeout(timeout);
                errorSubscription && errorSubscription();
                resolve(result);
            }

            function onError(error) {
                if (error.requestId !== requestId) return;
                
                cancelTimeout(timeout);
                successSubscription && successSubscription();
                reject(error);
            }

            function onTimeout() {
                successSubscription && successSubscription();
                errorSubscription && errorSubscription();
                reject({errorType: 'timeout'});
            }
        });
    });
}

// =>
// After

function  createRevision(fileId) {
    let _requestId;
    const ajax$ = Observable.fromPromise(
        restClient.createRevision(fileId).then((resp) => {
            _requestId = resp.requestId;
        })
    );

    const matchRequestId = ({requestId}) => requestId === _requestId;
    const success$ = Notificaitons.subject(EVENTS.FILE_REVISION_ADD).filter(matchRequestId);
    const error$ = Notificaitons.subject(EVENTS.FILE_REVISION_ADD_ERROR).filter(matchRequestId)
        .mapTo(Observable.throw());

    return new Promise((resolve, reject) => {
        ajax$
            .concatMapTo(success$)
            .merge(error$)
            .timeout(SERVER_TIMEOUT)
            .first()
            .subscribe({
                error: reject,
                complete: resolve,
            });
    });
}