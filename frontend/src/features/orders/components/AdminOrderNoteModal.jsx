import React from 'react';
import { Input, Modal, ModalBody, ModalFooter, ModalHeader, Button} from 'reactstrap';

export class AdminOrderNoteModal extends React.Component {
    state = {
        noteValue: this.props.noteData.value,
    };

    handleChange = ({ target }) => this.setState({ noteValue: target.value });

    handleConfirm = () => {
        this.props.onConfirm({
            id: this.props.noteData.id,
            orderDetails: {
                notes: this.state.noteValue,
            },
        });

        this.props.onCancel();
    };

    render() {
        return (
            <Modal isOpen={this.props.isOpen}>
              <ModalHeader>
                  <h4>
                      Add Note
                  </h4>
              </ModalHeader>
              <ModalBody>
                  <h4>Note:</h4>
                  <Input
                      type="textarea"
                      onChange={this.handleChange}
                      value={this.state.noteValue}
                      name="noteText"
                      id="note"
                  />
              </ModalBody>
              <ModalFooter>
                  <Button onClick={this.props.onCancel}>
                    Cancel
                  </Button>
                  <Button onClick={this.handleConfirm}>
                    OK
                  </Button>
              </ModalFooter>
            </Modal>
        );
    }
}
