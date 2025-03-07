import React from 'react';
import { shallow } from 'enzyme';

import OrderModal from 'src/features/dashboard/components/OrderModal';

describe('OrdersSection', () => {
    it('should render correctly', () => {
        const component = shallow(<OrderModal />);
        expect(component).toMatchSnapshot();
    });
});
