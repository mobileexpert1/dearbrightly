import React from 'react';
import styled from 'react-emotion'
import { Alert, Form, Input } from 'reactstrap'


import { graphql, createFragmentContainer } from 'react-relay'
import CreateNoteMutation from 'src/features/emr/mutations/CreateNoteMutation'
import SnippetListButton from 'src/features/emr/components/SnippetListButton'

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


class MedicalNoteComposer extends React.Component {

    state = {
        body: '',
        error: null
    }

    _createNote = () => {
        // Reset error state before the next request.
        this.setState({error: null})

        CreateNoteMutation(
            this.props.patient.uuid,
            this.state.body,
            (resp) => {
                this.setState({ body: '' })
                this.props.onSuccess()
            },
            (err) => {
                this.setState({ error: err })
            }
        )
    }

    selectedSnippetHandler = body => {
        this.setState({
            body: body
        })
    }

    render() {
        return (
            <Form onSubmit={(event) => event.preventDefault()}>
                {
                    this.state.error !== null ?
                        <Alert color="danger">There was an error. Please try again.</Alert>
                        : null
                }
                <span>
                    <SnippetListButton selectedSnippetHandler={this.selectedSnippetHandler} />
                    <Button className="pull-right" onClick={this._createNote}>Add</Button>
                </span>
                <Input
                    type="textarea"
                    name="text"
                    id="new-note"
                    style={{ marginBottom: "0.5em", resize: "none" }}
                    value={this.state.body}
                    onChange={(event) => this.setState({ body: event.target.value })}
                />
            </Form>
        )
    }
}

export default createFragmentContainer(
    MedicalNoteComposer,
    {
        patient: graphql`
            fragment MedicalNoteComposer_patient on UserType {
                uuid
            }
        `
    }
)

