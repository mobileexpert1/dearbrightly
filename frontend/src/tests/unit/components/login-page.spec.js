import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';

import LoginPage from 'src/features/auth/components/LoginPage';

const loginAction = () => {};

describe('LoginPage', () => {
    it('should render correctly', () => {
        const component = mount(<LoginPage />);
        expect(component).toMatchSnapshot();
    });

    it('should handle change and submit', () => {
        const component = mount(<LoginPage loginAction={loginAction} />);
        const instance = component.instance();
        const handleChange = sinon.spy(instance, 'handleChange');
        const handleSubmit = sinon.spy(instance, 'handleSubmit');
        expect(component.state('email')).toEqual('');
        expect(component.state('password')).toEqual('');
        expect(component.state('submitted')).toEqual(false);
        handleChange({ target: { name: 'email', value: 'user@email.com' } });
        handleChange({ target: { name: 'password', value: 'password123' } });
        expect(component.state('email')).toEqual('user@email.com');
        expect(component.state('password')).toEqual('password123');
        handleSubmit({ preventDefault: () => {} });
        expect(component.state('submitted')).toEqual(true);
    });
});
