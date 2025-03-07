import React from 'react'
import styled from 'react-emotion'

import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { graphql, QueryRenderer } from 'react-relay'
import { relayEnvironment } from 'src/common/services/RelayService'

import CreateSnippetModal from 'src/features/emr/containers/CreateSnippetModal'
import SnippetEntry from 'src/features/emr/components/SnippetEntry'

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


export default class SnippetListModal extends React.Component {

    state = {
        isCreateModalOpen: false
    }

    closeCreateModal = () => {
        this.setState({isCreateModalOpen: false})
    }

    openCreateModal = () => {
        this.setState({isCreateModalOpen: true})
    }

    render() {
        if (!this.props.isOpen) {
            return null
        }

        return (
            <QueryRenderer
                environment={relayEnvironment}
                // TODO: Support pagination on this component in case there are more than 100 snippets.
                query={graphql`
                    query SnippetListModalQuery {
                      allSnippets(last:100) @connection(key: "SnippetListModalQuery_allSnippets") {
                          edges {
                              node {
                                  id
                                  ...SnippetEntry_snippet
                              }
                          }
                      }
                    }
                  `}
                render={({ error, props }) => {
                    if (error) {
                        return (
                            <div>
                                <Modal
                                    isOpen={this.props.isOpen}
                                    autoFocus={true}
                                    centered={true}
                                >
                                    <ModalHeader>Saved Replies</ModalHeader>
                                    <ModalBody>
                                        <p>Error!</p>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button onClick={this.props.closeHandler}>Close</Button>
                                    </ModalFooter>
                                </Modal>
                            </div>
                        )
                    }
                    if (!props) {
                        return (
                            <div>
                                <Modal
                                    isOpen={this.props.isOpen}
                                    autoFocus={true}
                                    centered={true}
                                >
                                    <ModalHeader>Saved Replies</ModalHeader>
                                    <ModalBody>
                                        <p>Loading...</p>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button onClick={this.props.closeHandler}>Close</Button>
                                    </ModalFooter>
                                </Modal>
                            </div>
                        )
                    }

                    return (
                        <div>
                            <Modal
                                isOpen={this.props.isOpen}
                                autoFocus={true}
                                centered={true}
                            >
                                <ModalHeader>Saved Replies</ModalHeader>
                                <ModalBody style={{overflowY: "scroll", height: "15em"}}>
                                    <ul>
                                        {props.allSnippets.edges.map(edge =>
                                            <li key={edge.node.id}>
                                                <SnippetEntry
                                                    snippet={edge.node}
                                                    selectedSnippetHandler={this.props.selectedSnippetHandler} />
                                            </li>
                                        )}
                                    </ul>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onClick={this.openCreateModal}>Create Reply</Button>
                                    <Button onClick={this.props.closeHandler}>Close</Button>
                                </ModalFooter>
                            </Modal>
                            <CreateSnippetModal
                                isOpen={this.state.isCreateModalOpen}
                                closeHandler={this.closeCreateModal}
                            />
                        </div>
                    )
                }}
            />
        )
    }
}
