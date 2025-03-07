import React from 'react'
import styled from 'react-emotion'
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


class SnippetEntry extends React.Component {

    state = {
        hover: false
    }

    onMouseEnter = () => { 
        this.setState({
            hover: true
        })
    }

    onMouseLeave = () => {
        this.setState({
            hover: false
        })
    }

    render() {
        const { name, body } = this.props.snippet

        return (
            <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                <p style={{marginBottom: 0}}>
                    <strong>{name}</strong>
                    {this.state.hover?
                        <Button className="pull-right" onClick={() => this.props.selectedSnippetHandler(body)}>Select</Button>
                        : null}
                </p>
                <p className="snippet-body">{body}</p>
            </div>
        )
    }
}

export default createFragmentContainer(
    SnippetEntry,
    {
        snippet: graphql`
            fragment SnippetEntry_snippet on SnippetType {
                name
                body
            }
        `
    }
)

