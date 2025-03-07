import React from 'react';
import { shallow } from 'enzyme';

import Address from '../../../sections/dashboard/pages/Address';

describe('Address', () => {
    it('should render correctly', () => {
        const component = shallow(<Address />);
        expect(component).toMatchSnapshot();
    });
});
