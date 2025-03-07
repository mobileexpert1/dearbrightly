import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';

import ForgotPasswordContainer from 'src/features/auth/containers/ForgotPasswordContainer';

const resetPasswordAction = () => {};

describe('ForgotPassword', () => {
    it('should render correctly', () => {
        const component = mount(
            <ForgotPasswordContainer resetPasswordAction={resetPasswordAction} />,
        );
        expect(component).toMatchSnapshot();
    });

    it('should handle change and submit', () => {
        const component = mount(
            <ForgotPasswordContainer resetPasswordAction={resetPasswordAction} />,
        );
        const instance = component.instance();
        const handleChange = sinon.spy(instance, 'handleChange');
        const handleSubmit = sinon.spy(instance, 'handleSubmit');
        expect(component.state('email')).toEqual('');
        expect(component.state('submitted')).toEqual(false);
        handleChange({ target: { name: 'email', value: 'user@email.com' } });
        handleSubmit({ preventDefault: () => {} });
        expect(component.state('submitted')).toEqual(true);
    });
});
