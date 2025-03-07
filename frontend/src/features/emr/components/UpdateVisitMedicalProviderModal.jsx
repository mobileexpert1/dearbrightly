import React from 'react';
import { ModalFooter, Button, Modal, ModalHeader, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import styled from '@emotion/styled';
import { graphql, QueryRenderer } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'

const CustomModal = styled(Modal)`
  min-width: 500px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`
const CustomDropdown = styled(Dropdown)`
  margin: 20px;
`

const CustomButton = styled(Button)`
  width: 100px;
  height: 45px !important;
`

const EditButton = styled.button`
    font-size: 14px;
    padding: 2px;
    border: none;
    margin-left: 10px;
    background: none;
    color: #5c5c5c;
    &:focus {
      box-shadow: none;
      outline: 0;
    }
    &:hover {
      background-color: #fff;
      color: #a9a9a9;
      cursor: pointer;
    }
`;

export class UpdateVisitMedicalProviderModal extends React.Component {
  state = {
    showMedicalProviderEdit: false,
    showMedicalProviderDropdown: false,
    medicalProviderSelected: { 'fullName': this.props.defaultValue.fullName, 'id': this.props.defaultValue.id }
  }

  _toggleShowMedicalProviderDropdown = () => {
    this.setState(prevState => ({
      showMedicalProviderDropdown: !prevState.showMedicalProviderDropdown,
    }));
  };

  _toggleShowMedicalProviderEdit = () => {
    this.setState(prevState => ({
      showMedicalProviderEdit: !prevState.showMedicalProviderEdit,
    }));
  };

  _cancelMedicalProviderEdit = () => {
    this.setState({
      showMedicalProviderEdit: false,
    });
  }

  _saveMedicalProviderEdit = () => {
    this.setState({
      showMedicalProviderEdit: false,
    });
    this.props.onSave(this.state.medicalProviderSelected.id)
  }

  _setSelectedMedicalProvider = (selectedMedicalProvider) => {
    this.setState({
      medicalProviderSelected: selectedMedicalProvider,
    });
  };

  render() {
    return (
      <QueryRenderer
        environment={relayEnvironment}
        query={graphql`
                    query UpdateVisitMedicalProviderModalQuery {
                      allMedicalProviders {
                          edges {
                              node {
                                  id
                                  fullName
                              }
                          }
                      }
                    }
                  `}
        render={({ error, props }) => {
          if (error) {
            return <div>{error}</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return (
            <span>
              <EditButton onClick={() => this._toggleShowMedicalProviderEdit()}>
                <i className="fa fa-edit" aria-hidden="true"></i>
              </EditButton>
              {this.state.showMedicalProviderEdit && (
                <CustomModal isOpen={true} className="custom-modal-style">
                  <ModalHeader toggle={this._cancelMedicalProviderEdit}>Select medical provider</ModalHeader>
                  <CustomDropdown
                    isOpen={this.state.showMedicalProviderDropdown}
                    toggle={this._toggleShowMedicalProviderDropdown}
                  >
                    <DropdownToggle caret> {this.state.medicalProviderSelected.fullName} </DropdownToggle>
                    <DropdownMenu>
                      {props.allMedicalProviders && props.allMedicalProviders.edges.map(edge =>
                          <DropdownItem key={edge.node.id}>
                            <div
                              onClick={_.partial(this._setSelectedMedicalProvider, {'fullName': edge.node.fullName, 'id': edge.node.id}, false)}
                            >
                              {edge.node.fullName}
                            </div>
                          </DropdownItem>
                      )}
                    </DropdownMenu>
                  </CustomDropdown>
                  <ModalFooter>
                    <CustomButton color="primary" onClick={this._saveMedicalProviderEdit}>Save</CustomButton>
                    <CustomButton color="secondary" onClick={this._cancelMedicalProviderEdit}>Cancel</CustomButton>
                  </ModalFooter>
                </CustomModal>
              )}
            </span>
          )
        }}
      />
    )
  }
}


