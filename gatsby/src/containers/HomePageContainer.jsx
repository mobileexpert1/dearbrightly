import React, { Component } from "react"
import { HomePageC } from "src/components/homepage/HomePageC"
import {activateAndGetVariation} from 'src/common/services/OptimizelyService'

const DEBUG = process.env.DEBUG

export class HomePageContainer extends Component {
  state = {
    variation: '0',
  };

  componentDidMount() {

    // DEBUG expression has to be in the below format for Gatsby else it won't work.
    /*if (DEBUG === 'False') {
      // eslint-disable-next-line no-unde

      //this.getHowItWorksVariation();
    }*/

    if (typeof window !== "undefined") {
      if (window.fbq != null) {
        window.fbq('track', 'PageView')
      }
    }
  }

    // getHowItWorksVariation = () => {
    //   activateAndGetVariation('hp').then((variation) => {
    //       this.setState({ variation });
    //     });
    // }

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

  render() {
    let showBeforeAfterPhotos = !this.matchesTTQuery();

    return <HomePageC showBeforeAfterPhotos={showBeforeAfterPhotos} variation={this.state.variation} />
  }
}
