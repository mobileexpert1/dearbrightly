import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { HomePageC } from 'src/components/homepage/HomePageC';
import { getAllProducts } from 'src/features/products/selectors/productsSelectors';
import {activateAndGetVariation} from 'src/common/services/OptimizelyService'

const DEBUG = getEnvValue('DEBUG');

class HomePageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCarouselIndex: 0,
      activeTestimonialPhotosIndex: 0,
      variation: '0',
    }
  }

  componentDidMount() {

  }

  goToCarouselIndex = newIndex => {
    this.setState({ activeCarouselIndex: newIndex });
  };

  goToPhotosIndex = newIndex => {
    this.setState({ activeTestimonialPhotosIndex: newIndex });
  };

  // Tik Tok requirement: Don't show before and after section if query string matches ?qs=tt.
  // In any other case, it's okay to show.
  matchesTTQuery = () => {
    let isTTQuery = false;
    let query = null;
    if (typeof window !== 'undefined') {
      query = window.location.search;
    }

    if (query === '?qs=tt') {
      isTTQuery = true;
    }

    return isTTQuery;
  };

  // getHowItWorksVariation = () => {
  //   activateAndGetVariation('hp').then((variation) => {
  //     this.setState({ variation });
  //   });
  // }


  render() {
    let showBeforeAfterPhotos = !this.matchesTTQuery();

    return (
      <HomePageC
        products={this.props.products}
        goToCarouselIndex={this.goToCarouselIndex}
        activeCarouselIndex={this.state.activeCarouselIndex}
        goToPhotosIndex={this.goToPhotosIndex}
        activeTestimonialPhotosIndex={this.state.activeTestimonialPhotosIndex}
        showBeforeAfterPhotos={showBeforeAfterPhotos}
        variation={this.state.variation}
      />
    );
  }
}

const mapStateToProps = state => ({
  products: getAllProducts(state),
});

export default connect(mapStateToProps)(HomePageContainer);
