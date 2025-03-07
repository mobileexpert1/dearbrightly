import React from 'react';
import { shallow } from 'enzyme';

import Button from '../../../sections/common/Button/Button';

const blackButtonProps = {
    type: 'black',
    text: 'Create',
    onClick: () => {},
};

const clearButtonProps = {
    type: 'clear',
    text: 'Create',
    onClick: () => {},
};

const buttonProps = {
    text: 'Create',
    onClick: () => {},
};

describe('Button', () => {
    it('should render black button correctly', () => {
        const component = shallow(<Button {...blackButtonProps} />);
        expect(component).toMatchSnapshot();
    });

    it('should render clear button correctly', () => {
        const component = shallow(<Button {...clearButtonProps} />);
        expect(component).toMatchSnapshot();
    });

    it('should render default button correctly', () => {
        const component = shallow(<Button {...buttonProps} />);
        expect(component).toMatchSnapshot();
    });
});
