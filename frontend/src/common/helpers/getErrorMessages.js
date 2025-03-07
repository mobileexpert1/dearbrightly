import { config } from 'src/config';
import { mergeErrors } from 'src/common/helpers/mergeErrors';

export const getErrorMessages = error =>
    (error.body && error.body.detail) || config.genericError;
