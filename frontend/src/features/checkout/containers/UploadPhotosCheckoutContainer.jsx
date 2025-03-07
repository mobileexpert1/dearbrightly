import React from 'react';
import styled from 'react-emotion';
import { UploadPhotosContainer } from 'src/features/checkout/components/UploadPhotosContainer';
import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { breakpoints } from 'src/variables';
import { GTMUtils } from "src/common/helpers/gtmUtils";
import { getGTMOrderCheckoutEvent } from "src/common/helpers/getGTMOrderCheckoutEvent";

const DEBUG = getEnvValue('DEBUG');

const Wrapper = styled('div')`
  margin: 0 auto;
  width: fit-content;

  ${breakpoints.sm} {
    margin: 0;
    width: 100%;
  }
`;

class UploadPhotosCheckoutContainer extends React.Component {
  componentDidMount() {
    if (this.props.photoTypes.length > 1) {
      if (this.props.order) {
        const eventData = getGTMOrderCheckoutEvent(this.props.order.orderProducts);
        GTMUtils.trackCall('checkout_upload_photos_view', eventData);
      } else {
        GTMUtils.trackCall('checkout_upload_photos_view');
      }
    }
  }

  handleSubmitLastImage = () => {
    const { onSkinProfilePhotosUploadSuccess } = this.props;

    if (onSkinProfilePhotosUploadSuccess) {
      onSkinProfilePhotosUploadSuccess();
    }
  };

  render() {
    const { user, visit, navigateNext, photoTypes } = this.props;

    return (
      <Wrapper>
        <UploadPhotosContainer
          onSubmitLastImage={this.handleSubmitLastImage}
          user={user}
          visit={visit}
          photoTypes={photoTypes}
          navigateNext={navigateNext}
        />
      </Wrapper>
    );
  }
}

// TODO - Rename to UploadPhotosContainer since it's not only used for Checkout
export default UploadPhotosCheckoutContainer;