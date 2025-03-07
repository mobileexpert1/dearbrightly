import React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { Container } from 'reactstrap';
import { colors, breakpoints, fontSize, fontFamily } from 'src/variables';
import BottomNav from 'src/features/checkout/components/BottomNav';
import { CartSummary } from 'src/features/checkout/components/CartSummary';
import { getAllProducts } from 'src/features/products/selectors/productsSelectors';
import { getDiscount, getDiscountCode } from '../selectors/discountSelectors';
import { getOrder } from 'src/features/orders/selectors/orderSelectors';
import { GTMUtils } from "src/common/helpers/gtmUtils";

const Wrapper = styled('div')`
  margin: 150px auto;

  ${breakpoints.sm} {
    margin: 0 auto;
    height: fit-content;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 10px 20px 10px;
  text-align: left;
`;

const TitleText = styled.p`
  font-size: 24px;
  line-height: 28px;
  color: ${colors.blumine};
  font-weight: bold;
`;

const BodyText = styled.p`
  font-family: ${fontFamily.baseFont};
  font-size: 20px;
  color: ${colors.shark};
  line-height: 25px;
  padding: 0;   
`;

const CartWrapper = styled.div`
  padding-bottom: 20px;
  max-width: 530px;
  margin-left: auto;
  margin-right: auto;
}
`;

class SkinProfileCompleteComponent extends React.Component {
  constructor(props) {
    super(props);
  }  
  
  componentDidMount() {
    GTMUtils.trackCall('checkout_skin_profile_complete');
  }

  render() {
    const {
      order,
      products,
      navigateNext,
      navigateBack,
    } = this.props;
    return (
      <Wrapper
        ref={section => {
          this.componentTop = section;
        }}
      >
        <Container>
          <TextContainer>            
              <TitleText>Amazing, you finished your skin profile! So, what’s next?</TitleText>
              <BodyText>After confirming your payment and shipping info, you’ll upload a few selfies for our derm providers to review.</BodyText>
          </TextContainer>
          <CartWrapper>
          <CartSummary
            products={products}
            data={order.orderProducts}
            parent={'cartSummary'}
            total={order.totalAmount}
            order={order}
            showSubscription={false}
            showPrice={false}
          />
          </CartWrapper>
          <TextContainer>
              <BodyText>If prescribed, we’ll send your tailored Night Shift serum your way. There’s no pressure to stick with it - you can cancel any time.</BodyText>
          </TextContainer>
          <BottomNav
            currentCheckoutStepName={"skin profile complete"}
            backButtonType={"arrow"}
            backButtonClick={navigateBack}
            backButtonTitle={"Back"}
            disableBackButton={true}
            disableNextButton={false}
            hideNextButtonArrow={true}
            hideBackButton={false}
            nextButtonClick={navigateNext}
            nextTitle={'Continue'}
          />
        </Container>
      </Wrapper>
    );
  }
}


export const SkinProfileCompleteContainer = connect(
  state => ({
    products: getAllProducts(state),
    order: getOrder(state),
    discount: getDiscount(state),
    discountCode: getDiscountCode(state),
  }),
)(SkinProfileCompleteComponent);

export default SkinProfileCompleteContainer;