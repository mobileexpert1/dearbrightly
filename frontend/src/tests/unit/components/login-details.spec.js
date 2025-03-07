import React from 'react';
import { shallow } from 'enzyme';

import LoginDetails from 'src/user_dashboard/pages/LoginDetails';

describe('LoginDetails', () => {
    it('should render correctly', () => {
        const component = shallow(<LoginDetails />);
        expect(component).toMatchSnapshot();
    });
});
