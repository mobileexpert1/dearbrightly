/*
transforms:

{
    a: ['errorA'],
    b: ['errorB']
}

to:

 "errorA, errorB"
*/

export const mergeErrors = object =>
    Object.values(object)
        .map(arr => arr[0])
        .join(', ');
