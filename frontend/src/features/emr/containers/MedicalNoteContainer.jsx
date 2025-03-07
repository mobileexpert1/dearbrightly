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


class MedicalNoteContainer extends React.Component {
  state = {
    showComposer: false
  }

  componentDidMount () {
    this.scrollToTop()
  }

  componentDidUpdate () {
    this.scrollToTop()
  }

  scrollToTop = () => {
    this.medicalNoteRef.scrollBottom = this.medicalNoteRef.scrollHeight;
  }

  render() {
    let { medicalNotes } = this.props.patient
    if (medicalNotes === undefined) {
      medicalNotes = {edges: []}
    }

    return (
      <div>
        <strong>
          <p style={{ marginBottom: "1em" }}>
            Note History
            <Button className="pull-right" onClick={() => this.setState({ showComposer: !this.state.showComposer })}>
              {this.state.showComposer ? "Cancel" : "New"}
            </Button>
          </p>
        </strong>
        {
          this.state.showComposer &&
          <MedicalNoteComposer
            patient={this.props.patient}
            onSuccess={() => this.setState({ showComposer: false })}
            onError={(err) => console.log(err)}
          />
        }
        <div ref={(el) => { this.medicalNoteRef = el;}} style={{overflowY:"auto", width:"100%", height:"300px", marginTop:"5px"}}>
          {medicalNotes.edges.length === 0? <p>There are no notes for this patient.</p> : null}
          <ul>
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
      </div >
    )
  }
}

export default createFragmentContainer(
  MedicalNoteContainer,
  {
    patient: graphql`
            fragment MedicalNoteContainer_patient on UserType {
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

