import React from 'react';
import moment from 'moment'
import {
  Alert
} from 'reactstrap'
import UpdateFlagMutation from 'src/features/emr/mutations/UpdateFlagMutation'

import { graphql, createFragmentContainer } from 'react-relay'
import { colorForEMRFlagCategory, reactStrapColorForEMRFlagCategory } from 'src/common/helpers/colorForEMRFlagCategory';

class Flag extends React.Component {

  state = {
    visible: true
  }

  onDismiss = () => {
    this._updateFlag()
  }

  _updateFlag = () => {
    const { flagId } = this.props.flag

    UpdateFlagMutation(
      flagId,
      (resp) => {
        this.setState({ visible: false })
      },
      (err) => {
        this.setState({ error: err })
      }
    )
  }

  render() {
      const { creator, body, category, createdDatetime } = this.props.flag
      const creatorName = creator && creator.fullName ? creator.fullName : 'Unknown'
      const color = reactStrapColorForEMRFlagCategory(category)


      return (
        <Alert color={color} isOpen={this.state.visible} toggle={this.onDismiss}>
              <p style={{marginBottom: 0}}>{body}</p>
              <div className="small" style={{marginBottom: "0.5em"}}>{creatorName} <span className="pull-right">{moment(createdDatetime).fromNow()}</span></div>
        </Alert>
      )
  }
}

export default createFragmentContainer(
    Flag,
    {
        flag: graphql`
            fragment Flag_flag on FlagType {
                flagId
                creator {
                    fullName
                }
                body
                createdDatetime
                category
            }
        `
    }
)

