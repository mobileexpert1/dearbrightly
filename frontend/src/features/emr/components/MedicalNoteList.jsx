import React from 'react'
import styled from 'react-emotion'

import MedicalNote from 'src/features/emr/components/MedicalNote'
import MedicalNoteComposer from 'src/features/emr/components/MedicalNoteComposer'

import { graphql, createFragmentContainer } from 'react-relay'


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


class MedicalNoteList extends React.Component {

    state = {
        showComposer: false
    }

    render() {
        const { medicalNotes } = this.props.patient

        return (
            <div style={{height: "40%"}}>
                <strong>
                    <p style={{ marginBottom: "1em" }}>
                        Note History
                        <Button className="pull-right" onClick={() => this.setState({ showComposer: !this.state.showComposer })}>
                            {this.state.showComposer? "Hide" : "New"}
                        </Button>
                    </p>
                </strong>
                <ul style={{clear: "both"}}>
                    {medicalNotes.edges.map(edge =>
                        <li key={edge.node.id}>
                            <MedicalNote
                                key={edge.node.id}
                                note={edge.node}
                            />
                        </li>
                    )}
                </ul>
            </div>
        )
    }
}

export default createFragmentContainer(
    MedicalNoteList,
    {
        patient: graphql`
            fragment MedicalNoteList_patient on UserType {
                ...MedicalNoteComposer_patient
                medicalNotes {
                    edges {
                        node {
                            id
                            ...MedicalNote_note
                        }
                    }
                }
            }
        `
    }
)

