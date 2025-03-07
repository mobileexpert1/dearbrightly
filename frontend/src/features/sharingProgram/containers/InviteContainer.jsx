import React from 'react';
import {
  extractedSharingCode,
} from 'src/features/sharingProgram/helpers/sharingHelpers';
import { redirectToUrl } from 'src/common/actions/navigationActions';
import {connect} from "react-redux";
import {saveIfEmpty} from 'src/common/helpers/localStorage';

class InviteContainer extends React.Component {
  componentDidMount() {
    const {redirectToUrl} = this.props;
    const sharingProgramCode = extractedSharingCode(window.location.pathname);

    if (sharingProgramCode) {
      saveIfEmpty('sp_c', sharingProgramCode)
    }

    redirectToUrl('/');
  }

  render() {
    return (
      <div></div>
    );
  }
}

const mapStateToProps = state => ({
});

export default connect(
  mapStateToProps,
  {
    redirectToUrl,
  },
)(InviteContainer);