import React, { useEffect } from 'react';
import styled from 'react-emotion';
import { Col, Container } from 'reactstrap';
import scrollToComponent from 'react-scroll-to-component';
import { Helmet } from 'react-helmet';
import { isProduct } from 'src/common/helpers/isProduct';
import { ProductDetailFormComponentRx } from 'src/features/products/components/ProductDetailFormRx';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import {
  klaviyoTrackViewedProduct,
  klaviyoTrackAddedToCart,
} from 'src/common/helpers/klaviyoUtils';
import optimizelyService from 'src/common/services/OptimizelyService';
import { GTMUtils } from 'src/common/helpers/gtmUtils';
import { getProductURL } from 'src/common/helpers/getProductURL';
import { OtcProductDescription } from 'src/features/products/components/OtcProductDescription';
import { colors, breakpoints, fontFamily } from 'src/variables';
import { getFBPixelURL } from 'src/common/helpers/fbPixelUtils';
import { ProductDescription } from './ProductDescription';
import { RetinoidDescription } from './RetinoidDescription';
import { ProductDetailFormComponent } from './ProductDetailForm';
import { Benefits } from './Benefits';
import * as S from './styles';
import {
  isFBPixelTracked,
} from 'src/features/analytics/selectors/analyticsSelectors';
import {getGTMItems} from "src/common/helpers/getGTMItems";

const DEBUG = getEnvValue('DEBUG');

const Wrapper = styled('div')`
  .container {
    @media (min-width: 1200px) {
      margin: 0 !important;
      padding-left: 2%;
      // max-width: 66% !important;
    }
  }
`;
const TopWrapper = styled('div')`
  background: url(${props => (props.image ? props.image : '')}) top left no-repeat;
  background-size: 100%;
  padding: 135px 0 60px;
  width: 100%;
  height: 500px;

  @media (min-width: 1201px) {
    margin-left: 3%;
  }
  @media (min-width: 1001px) and (max-width: 1200px) {
    padding: 82px 0 60px;
  }
  @media (min-width: 768px) and (max-width: 1000px) {
    padding: 34px 0 60px;
  }
  @media (max-width: 768px) {
    background: white;
    padding: 0px;
    height: auto;
  }
`;
const BottomMargin = styled('div')`
  margin-bottom: 90px;
`;
const ProductInfoSection = styled('section')`
  @media (min-width: 1200px) {
    padding: 40px 0 10px;
    padding-left: 2%;
  }
  @media (max-width: 1200px) {
    margin: 0 auto;
    padding: 50px 0 10px;
  }
  h2 {
    margin-bottom: 20px;
  }
  h3 {
    margin-bottom: 20px;
  }
  p {
    margin-bottom: 30px;
  }
`;
const IngredientsSubTitle = styled('div')`
  font-size: 12px;
  color: #000;
  font-family: ${fontFamily.baseFont};
  margin-top: 15px;
  font-style: italic;
`;
const IngredientsHighlight = styled('div')`
  padding-bottom: 25px;
  font-size: 13px;
  span {
    text-decoration: underline;
  }
`;
const MobileImageWrapper = styled('div')`
  display: none;
  overflow: hidden;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    display: block;
  }
  @media (max-width: 768px) {
    img {
      margin-top: 40px;
      max-height: 440px;
      min-width: 100%;
    }
  }
  @media (max-width: 600px) {
    img {
      margin-top: 40px;
      max-height: 260px;
      min-width: 100%;
    }
  }
  @media (max-width: 380px) {
    img {
      margin-top: 40px;
      max-height: 200px;
      min-width: 100%;
    }
  }
`;
const MainWraper = styled('div')`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  @media (max-width: 1200px) {
    display: block;
  }
`;
const LeftSection = styled('div')`
  width: calc(100% - 445px);
  @media (max-width: 1200px) {
    width: 100%;
  }
`;
const RightSection = styled('div')`
  width: 445px;
  position: relative;
`;
const AbsolutePositioned = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  @media (max-width: 1200px) {
    display: none;
  }
`;
const MobileContainer = styled('div')`
  @media (min-width: 1201px) {
    display: none;
  }
`;
const InfoSectionWrapper = styled('div')`
  display: flex;
  justify-content: space-around;
  width: 100%;
  ${breakpoints.xs} {
    flex-wrap: wrap-reverse;
  }
`;
const LeftInfoWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
const RightInfoWrapper = styled('div')`
  padding: 30px 7px;
  min-width: 350px;
  max-width: 350px;
  background-color: ${colors.veryLightGray};
  height: fit-content;
`;
export class ProductDetail extends React.Component {
  state = {
    showAllIngredients: false,
    isTracked: false,
    isKlaviyoTracked: false,
    isItemAddedToCart: false,
  };

  componentDidMount() {
    const { data } = this.props;
    const { isTracked, isKlaviyoTracked } = this.state;

    scrollToComponent(this.productComponentTop, { offset: 0 });

    if (data && !isKlaviyoTracked) {
      this.klaviyoViewedProduct(data);
    }

    if (!DEBUG && !isTracked) {
      //window.fbq('track', 'ViewContent');
      // optimizelyService.track('db-product-details-page');
      this.setState({ isTracked: true });
    }

    this.setState({ contentViewed: true });
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    const { isTracked, isKlaviyoTracked } = this.state;

    if (data && (!isKlaviyoTracked || prevProps.data != data)) {
      this.klaviyoViewedProduct(data);
    }

    if (!DEBUG && (!isTracked || prevProps.data != data)) {
      // optimizelyService.track('db-product-details-page');
      this.setState({ isTracked: true });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  klaviyoViewedProduct = data => {
    const isTrackSuccess = klaviyoTrackViewedProduct(data, window.location.origin);
    if (isTrackSuccess) {
      this.setState({ isKlaviyoTracked: true });
    }
  };

  onAddToBag = (freq, selectedQuantity) => {
    const {
      data,
      isAuthenticated,
      rxSubscription,
      shoppingBagAdd,
      shoppingBagUpdateQuantity,
      shoppingBagRemoveItem,
      shoppingBag,
    } = this.props;
    // const isRetinoid = isProduct(data.productCategory, "retinoid");
    // const frequency = isRetinoid ? 3 : 0;
    const frequency = freq ? 3 : 0;

    // TODO (Alda) - Remove price, type, sku, image, and category (not used)
    // Create a class for this data model?
    const orderItemData = {
      quantity: selectedQuantity,
      frequency,
      productUuid: data.id,
      productName: data.name,
      trialPrice: data.trialPrice,
      refillPrice: data.refillPrice,
      type: data.productType,
      sku: data.sku,
      image: data.image,
      category: data.productCategory,
      subscriptionPrice: data.subscriptionPrice,
      price: data.price,
    };

    this.setState({ isItemAddedToCart: true });

    if (data.productType === 'OTC') {
      const filteredShoppingBag =
        shoppingBag &&
        shoppingBag.filter(
          item => item.category === data.productCategory && item.frequency === frequency,
        );
      const isInShoppingBag = filteredShoppingBag && filteredShoppingBag.length > 0;

      if (isInShoppingBag) {
        const { productUuid, quantity } = filteredShoppingBag[0];
        shoppingBagUpdateQuantity(productUuid, parseInt(quantity, 10) + 1);
      } else {
        shoppingBagAdd(orderItemData);
      }
    }

    if (data.productType === 'None') {
      shoppingBagAdd(orderItemData);
    }

    if (data.productType === 'Rx') {
      // If there is already a Rx item in the bag (whether it's the same retinoid SKU or not), replace with the latest Rx item.
      const rxItemInBag = shoppingBag.filter(item => isProduct(item.category, 'retinoid'));
      if (rxItemInBag.length > 0) {
        shoppingBagRemoveItem(rxItemInBag[0].productUuid); // There will only ever be one Rx item in bag at a time.
      }
      shoppingBagAdd(orderItemData);
    }

    const eventData = getGTMItems([orderItemData]);
    GTMUtils.trackCall('add_to_cart_click', eventData);

    //window.fbq('track', 'AddToCart');

    // if (!DEBUG) {
    //   optimizelyService.track('add_to_cart_click');
    // }

    klaviyoTrackAddedToCart(orderItemData, shoppingBag, window.location.origin);

    if (data.productType === 'Rx') {
      if (isAuthenticated) {
        if (rxSubscription) {
          this.props.navigateCheckout('your plan', true);
        } else {
          this.props.navigateCheckout('skin profile', true);
        }
      } else {
        this.props.navigateCheckout('sign up', true);
      }
    } else {
      this.props.navigateCheckout('your plan', true);
    }
  };

  showAllIngredients = () => {
    this.setState(prevState => ({
      showAllIngredients: !prevState.showAllIngredients,
    }));
  };

  render() {
    const { data, user, fbPixelAddToCartTrackedEventIDs, fbPixelContentViewTrackedEventIDs, setFBPixelTracked } = this.props;
    const { isItemAddedToCart, showAllIngredients } = this.state;
    const isRx = isProduct(data.productType, 'Rx');
    const isOTC = isProduct(data.productType, 'OTC');
    const viewIngredientListText = showAllIngredients ? '' : 'Click to see full list';
    const productURL = getProductURL(window.location.origin, data.name);

    {/* FB Pixel Logic */}
    const isFBPixelAddToCartTracked = isFBPixelTracked(fbPixelAddToCartTrackedEventIDs, data.id);
    const fbPixelAddToCartURL = !isFBPixelAddToCartTracked && isItemAddedToCart && data ? getFBPixelURL(user, null,'AddToCart', null, [data]) : null;
    const isFBPixelContentViewTracked = isFBPixelTracked(fbPixelContentViewTrackedEventIDs, data.id);
    const fbPixelViewContentURL = !isFBPixelContentViewTracked && data ? getFBPixelURL(user, null,'ViewContent', null, [data]) : null;
    if (!isFBPixelContentViewTracked && fbPixelViewContentURL) { setFBPixelTracked("ContentView", data.id); }
    if (!isFBPixelAddToCartTracked && fbPixelAddToCartURL) { setFBPixelTracked("AddToCart", data.id); this.setState({ isItemAddedToCart: false });}
    {/********************/}

    const sortedHighlights = data.ingredientsHighlight.map((item, index) => {
      const delimeterIndex = item.lastIndexOf(':');
      const heading = item.substr(0, delimeterIndex);
      const description = item.substr(delimeterIndex + 1);
      return (
        <dl key={index}>
          <dt style={{ fontSize: '12px', fontWeight: '700' }}>{heading}</dt>
          <dd
            style={{
              fontSize: '12px',
              color: `${colors.veryThinGrey}`,
              paddingLeft: '10px',
              paddingTop: '8px',
            }}
          >
            {description}
          </dd>
        </dl>
      );
    });
    if (!data) {
      return null;
    }

    return (
      <React.Fragment>
        <Helmet>
          <meta property="og:type" content="website" />
          <meta property="og:url" content={productURL} />
          <meta property="og:title" content={data.name} />
          <meta property="og:description" content={data.description} />
          <meta property="og:image" content={data.image} />
        </Helmet>

        <MainWraper
          ref={section => {
            this.productComponentTop = section;
          }}
        >
          {/* FB Pixel Logic */}
          { fbPixelAddToCartURL && (
              <img id="fbPixel" style={{ height: 1, width: 1, display: 'none' }}
                   src={ fbPixelAddToCartURL }
              />
          )}
          { fbPixelViewContentURL && (
              <img id="fbPixel" style={{ height: 1, width: 1, display: 'none' }}
                   src={ fbPixelViewContentURL }
              />
          )}
          {/********************/}
          <LeftSection>
            <TopWrapper
              image={data.largeImage}
              ref={section => {
                this.product = section;
              }}
            >
              <MobileImageWrapper>
                <img src={data.largeImage} alt="large" />
              </MobileImageWrapper>
              <MobileContainer>
                {isRx ? (
                  <ProductDetailFormComponentRx data={data} onAddToBag={this.onAddToBag} />
                ) : (
                  <ProductDetailFormComponent data={data} onAddToBag={this.onAddToBag} />
                )}
              </MobileContainer>
            </TopWrapper>
            {(isRx || isOTC) && (
            <ProductInfoSection>
              <Container style={{ width: '100%' }}>
                <InfoSectionWrapper>
                  <LeftInfoWrapper>
                    <ProductDescription isRx={isRx} data={data} />
                    <Col sm={12} style={{ padding: '0px 48px 0px 0px' }}>
                      {isRx && <RetinoidDescription />}
                      {isOTC && <OtcProductDescription product={data} />}
                      {data.benefits && <Benefits benefits={data.benefits} />}
                    </Col>
                  </LeftInfoWrapper>
                  <RightInfoWrapper>
                    <Col sm={12}>
                      {data.ingredientsHighlight && (
                        <IngredientsHighlight>
                          <S.Heading2
                            bold
                            style={{
                              fontSize: '14px',
                              fontFamily: fontFamily.baseFont,
                              fontWeight: '700',
                              marginBottom: '20px',
                            }}
                          >
                            Ingredients Highlight
                          </S.Heading2>
                          {sortedHighlights}
                          <div
                            style={{
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              color: `${colors.facebookBlue}`,
                            }}
                            onClick={this.showAllIngredients}
                          >
                            {viewIngredientListText}
                          </div>
                          {showAllIngredients && (
                            <div style={{ fontSize: '12px', color: `${colors.veryThinGrey}` }}>
                              {data.ingredients}
                            </div>
                          )}
                          <IngredientsSubTitle>
                            All products are cruelty-free, paraben-free, mineral oil-free, and vegan.
                          </IngredientsSubTitle>
                        </IngredientsHighlight>
                      )}
                    </Col>
                  </RightInfoWrapper>
                </InfoSectionWrapper>
              </Container>
            </ProductInfoSection>
            )}
          </LeftSection>
          <RightSection>
            {/* for desktop */}
            <AbsolutePositioned>
              {isRx ? (
                <ProductDetailFormComponentRx data={data} onAddToBag={this.onAddToBag} />
              ) : (
                <ProductDetailFormComponent data={data} onAddToBag={this.onAddToBag} />
              )}
            </AbsolutePositioned>
          </RightSection>
        </MainWraper>
      </React.Fragment>
    );
  }
}
