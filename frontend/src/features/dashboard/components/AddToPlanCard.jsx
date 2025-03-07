import React from 'react';
import styled from 'react-emotion';
import { breakpoints, colors } from 'src/variables';
import AddToPlanModal from './AddToPlanModal';
import { RxBadge } from 'src/features/dashboard/shared/styles';
import {
  isUpdatingSubscription,
  getSubscriptionsErrorMessage,
} from 'src/features/subscriptions/selectors/subscriptionsSelectors';
import { getMedicalVisit } from 'src/features/medicalSurvey/selectors/medicalSurveySelectors';
import useDeviceDetect from 'src/common/hooks/useDeviceDetect';
import { getAllProducts } from 'src/features/products/selectors/productsSelectors';
import { getUserData } from 'src/features/user/selectors/userSelectors';
import { getOrder } from 'src/features/orders/selectors/orderSelectors';
import { navigateOrderCheckout } from 'src/features/checkout/actions/checkoutStepsActions';
import { connect } from 'react-redux';
import { formatAmountToDollarsWithCents } from "src/common/helpers/formatAmountToDollars";

const CardContainer = styled.div`
  border: 1px solid ${colors.brightGray};
  border-radius: 6px;
`;

const Card = styled.div``;

const CardBody = styled.div``;

const CardTitle = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${colors.facebookBlue};
`;

const CardText = styled.div`
  font-weight: bold;
  font-size: small;
`;

const CardDescription = styled.div`
  color: ${props => props.warning ? colors.red : colors.black};
  font-size: small;
  height: 40px
`;

const StyledButton = styled.button`
  cursor: pointer;
  font-size: 14px;
  line-height: 17px;
  color: ${colors.darkModerateBlue};
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border: 1px solid ${colors.facebookBlue};
  background-color: ${colors.clear};
  display: ${props => props.mobile && 'none'};

  :hover {
    background-color: ${colors.darkModerateBlue};
    color: ${colors.clear};
  }
  ${breakpoints.sm} {
    width: 100%;
  }
`;

const ProductImage = styled.img`
  border-radius: 5px;
  max-width: 240px;
  max-height: 240px;
`;

class AddToPlanCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddToPlanModalActive: false,
      showRestartPlanModal: false,
    };
  }

  toggleModal = modalState => {
    this.setState(prevState => ({
      [modalState]: !prevState[modalState],
    }));
  };
  showRestartPlanModal = () => {
    this.setState({
      showRestartPlanModal: true,
    });
  };
  isMobile = () => {
    const {isMobile} = useDeviceDetect()
    return isMobile
  }
   render() {
    const {
      recommendedProduct,
      subscriptionBundleOptions,
      updateOrCreateSubscriptionRequest,
      user
    } = this.props;
    const addToPlanModal = 'isAddToPlanModalActive';
    const product = recommendedProduct && recommendedProduct;
    const formattedMonthlyPrice = formatAmountToDollarsWithCents(product.subscriptionPrice/3);
    const formattedTotalPrice = formatAmountToDollarsWithCents(product.subscriptionPrice);
    return (
        <CardContainer className="mb-5 mr-3">
          <Card className="card p-3 border-0">
            <ProductImage alt="Product" className="card-img-top" src={product.image} />
            <CardBody className="card-body pl-0 pr-0">
                <CardTitle className="card-title mb-4">
                    {product.name}{' '}
                    {product.productType === 'Rx' ? (
                        <RxBadge>
                            RX
                        </RxBadge>
                    ) : null}
                </CardTitle>
                <CardText className="card-text mb-3">
                    {formattedMonthlyPrice}
                    /mo
                </CardText>
                <CardText className="card-text mb-2">REFILL FREQUENCY</CardText>
                <CardDescription className="mb-3">
                    Ships and bills every <b>3 months</b> at {formattedTotalPrice}
                </CardDescription>
                <StyledButton onClick={() => this.toggleModal(addToPlanModal)}>
                    Add to Plan
                </StyledButton>
              <AddToPlanModal
                  isMobile={() => isMobile()}
                  isVisible={this.state.isAddToPlanModalActive}
                  toggleAddToPlanModal={() => this.toggleModal(addToPlanModal)}
                  updateOrCreateSubscriptionRequest={updateOrCreateSubscriptionRequest}
                  recommendedProduct={recommendedProduct}
                  user={user}
                  subscriptionBundleOptions={subscriptionBundleOptions}
              />
            </CardBody>
          </Card>
        </CardContainer>
    );
  }
}

export default connect(
    state => ({
      subscriptionErrorMessage: getSubscriptionsErrorMessage(state),
      isUpdatingSubscription: isUpdatingSubscription(state),
      visit: getMedicalVisit(state),
      products: getAllProducts(state),
      user: getUserData(state),
      pendingCheckoutOrder: getOrder(state),
    }),
    {
      navigateOrderCheckout,
    },
)(AddToPlanCard);
