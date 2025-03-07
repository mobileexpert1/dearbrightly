export const isPasswordValid = password => {
    // Minimum eight characters,
    // at least one uppercase letter and one lowercase letter
    // at least one number
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    return pattern.test(password);
};
