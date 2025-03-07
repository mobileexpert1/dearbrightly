import React from 'react';
import styled from 'react-emotion'

import SnippetListModal from 'src/features/emr/containers/SnippetListModal'

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


export default class SnippetListButton extends React.Component {

    state = {
        isModalOpen: false
    }

    closeModal = () => {
        this.setState({isModalOpen: false})
    }

    selectedSnippetHandler = body => {
        this.props.selectedSnippetHandler(body)
        this.closeModal()
    }

    render() {
        return (
            <div>
                <Button className="pull-left" onClick={() => this.setState({ isModalOpen: true })}>Saved Replies</Button>
                <SnippetListModal
                    isOpen={this.state.isModalOpen}
                    closeHandler={this.closeModal}
                    selectedSnippetHandler={this.selectedSnippetHandler}
                />
            </div>
        )
    }
}

