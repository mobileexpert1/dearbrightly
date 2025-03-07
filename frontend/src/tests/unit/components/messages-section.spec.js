import React from 'react';
import { shallow } from 'enzyme';

import MessagesSection from '../../../sections/dashboard/pages/MessagesSection';

describe('MessagesSection', () => {
    it('should render correctly', () => {
        const component = shallow(<MessagesSection />);
        expect(component).toMatchSnapshot();
    });
});
