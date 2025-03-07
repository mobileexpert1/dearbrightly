import React from 'react';
import styled from 'react-emotion';
import { Table } from 'reactstrap';
import { RxBadge } from 'src/features/dashboard/shared/styles';
import { EditSubscriptionModal } from './EditSubscriptionModal';
import { colors, fontFamily } from 'src/variables';

const EditButton = styled.button`
  background: none;
  border: none;
  font-family: ${fontFamily.baseFont};
  text-decoration: underline;
  color: ${colors.facebookBlue};
  font-size: 13px;

  &:focus {
    outline: none;
  }
`;

const headerFontStyles = {
  fontSize: '12px',
};

const fontStyles = {
  fontSize: '10px',
};

const productFontStyles = {
  fontSize: '10px',
  fontWeight: 'bold',
};

const TrackOrderButton = styled.button`
  background: ${colors.indigoWhite};
  border-radius: 5px;
  font-weight: bold;
  font-size: 10px;
  text-align: center;
  text-decoration-line: underline;
  color: ${colors.facebookBlue};
  border: none;
  padding-left: 1rem;
  padding-right: 1rem;
  height: ${props => (props.height ? `${props.height}px` : '30px')};

  :disabled {
    background: ${colors.guyabano};
    color: ${colors.silverFoil};
    text-decoration: none;
    padding: 0;
    height: auto;
    width: 5.5rem;
  }
`;

const Tbody = styled.tbody`
  border-bottom: 1px solid #dee2e6;
`;
export default class UpcomingOrdersMobile extends React.Component {
  state = {
    isSubscriptionModalVisible: false,
  };

  toggleModal = modalState => {
    this.setState(prevState => ({
      [modalState]: !prevState[modalState],
    }));
  };

  render() {
    const subscriptionModal = 'isSubscriptionModalVisible';
    return (
      <div className="mx-3 py-3">
        <Table>
          <thead>
            <tr>
              <th
                className="border-top-0 border-bottom-0 text-black-50 font-weight-normal fs-2 pb-1"
                style={headerFontStyles}
              >
                Shipment date
              </th>
              <th
                className="border-top-0 border-bottom-0 text-black-50 font-weight-normal fs-6 pb-1"
                style={headerFontStyles}
              >
                Order Summary
              </th>
              <th className="border-top-0 text-black-50 font-weight-normal border-bottom-0 pb-1" />
            </tr>
          </thead>
          <Tbody>
            <tr>
              <td className="border-bottom">
                <div style={fontStyles} className="pb-3 align-middle">
                  12/11/2021
                </div>
                <TrackOrderButton disabled> Upcoming </TrackOrderButton>
              </td>
              <td>
                <div style={productFontStyles} className="pb-3 align-middle">
                  1x Night Shift <RxBadge padding="0.2em 0.4em">RX</RxBadge>
                </div>
                <div style={fontStyles}>3338 17th St Ste 100</div>
                <div style={fontStyles} className="align-middle border-bottom-1">
                  San Francisco, CA, 94110
                </div>
              </td>
              <td className="align-bottom">
                <EditButton
                  className="pr-0"
                  color="secondary"
                  onClick={() => this.toggleModal(subscriptionModal)}
                  style={fontStyles}
                >
                  Edit
                </EditButton>
                <EditSubscriptionModal
                  isVisible={this.state.isSubscriptionModalVisible}
                  toggleSubscriptionModal={() => this.toggleModal(subscriptionModal)}
                />
              </td>
            </tr>
          </Tbody>
        </Table>
        <p className="text-right my-1" style={fontStyles}>
          To view past orders, click &nbsp;
          <a style={{ color: '#3B5998', textDecoration: 'underline' }}>here</a>
        </p>
      </div>
    );
  }
}
