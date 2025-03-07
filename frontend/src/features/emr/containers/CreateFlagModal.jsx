import React from 'react'
import {
  Alert,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  Input,
} from 'reactstrap'
import CreateFlagMutation from 'src/features/emr/mutations/CreateFlagMutation'


export default class CreateFlagModal extends React.Component {

  state = {
    isModalOpen: false,
    body: '',
    error: null
  }

  _createFlag = () => {
    // Reset error state before the next request.
    this.setState({error: null})
    const { visitUuid } = this.props

    const body = this.state.body ? this.state.body : null

    CreateFlagMutation(
      visitUuid,
      body,
      (resp) => {
        this.setState({ body: '' })
        if (this.props.onSuccess) {
          this.props.onSuccess()
        }
        this.props.closeHandler()
      },
      (err) => {
        this.setState({ error: err })
      }
    )
  }

  render() {
    if (!this.props.isOpen) {
      return null
    }

    return (
      <div>
        <Modal
          isOpen={this.props.isOpen}
          autoFocus={true}
          centered={true}
        >
          <ModalHeader>Add Flag</ModalHeader>
          <ModalBody>
            <Form onSubmit={(event) => event.preventDefault()}>
              {
                this.state.error !== null ?
                  <Alert color="danger">There was an error. Please try again.</Alert>
                  : null
              }
              <Input
                type="textarea"
                name="text"
                id="new-flag-message"
                style={{ marginBottom: "0.5em", resize: "none" }}
                value={this.state.body}
                onChange={(event) => this.setState({ body: event.target.value })}
              />
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button className="pull-left" size="sm" color="outline-primary" onClick={this.props.closeHandler}>Close</Button>
            <Button className="pull-right" size="sm" color="outline-primary" onClick={this._createFlag}>Add</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}