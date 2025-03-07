export const getEnvValue = key => {
    const variable = process.env[key];

    if (variable !== undefined) {
        let variableString = variable.toString();
        if (variableString === 'True') {
            return true;
        }
        if (variableString === 'False') {
            return false;
        }
        return variableString;
    }
    return '';
};
