import React from 'react';
import moment from 'moment'


import { graphql, createFragmentContainer } from 'react-relay'


class MedicalNote extends React.Component {

    render() {
        const { creator, body, createdDatetime } = this.props.note
        const creatorName = creator && creator.fullName ? creator.fullName : 'Unknown'

        return (
            <div>
                <p style={{marginBottom: 0}}>{body}</p>
                <div className="small" style={{marginBottom: "0.5em"}}>{creatorName} <span className="pull-right">{moment(createdDatetime).fromNow()}</span></div>
            </div>
        )
    }
}

export default createFragmentContainer(
    MedicalNote,
    {
        note: graphql`
            fragment MedicalNote_note on NoteType {
                creator {
                    fullName
                }
                body
                createdDatetime
            }
        `
    }
)

