import React from 'react'
import styled from 'react-emotion'

import { 
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input
} from 'reactstrap'

import CreateSnippetMutation from 'src/features/emr/mutations/CreateSnippetMutation'

const Button = styled.button`
    border: 2px solid #ededed;
    height: 30px;
    font-size: 14px;
    margin-right: 6px;
    background-color: #fff;
    transition: 0.25s all;

    &:hover {
        background-color: #333;
        border: 2px solid #333;
        color: #fff;
        cursor: pointer;
    }
`;


export default class CreateSnippetModal extends React.Component {

    state = {
        name: '',
        body: '',
        error: null
    }

    _createSnippet = () => {
        CreateSnippetMutation(
            this.state.name,
            this.state.body,
            resp => {
                this.setState({name: '', body: '', error: null})
                this.props.closeHandler()
            },
            err => {
                this.setState({error: err})
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
                    <ModalHeader>Create Snippet</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={(event) => event.preventDefault()}>
                            <FormGroup style={{width: "100%"}}>
                                <Label for="name">Name</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    id="snippet-name"
                                    onChange={(event) => this.setState({name: event.target.value})}
                                 />
                            </FormGroup>
                            <FormGroup style={{width: "100%"}}>
                                <Label for="body">Content</Label>
                                <Input
                                    type="textarea"
                                    name="body"
                                    id="snippet-body"
                                    onChange={(event) => this.setState({body: event.target.value})}
                                />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.props.closeHandler}>Close</Button>
                        <Button onClick={this._createSnippet}>Create Snippet</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
