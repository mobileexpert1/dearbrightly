import React from 'react';
import styled from 'react-emotion';
import { MessageDetailModal } from 'src/features/dashboard/components/MessageDetailModal';

const TableRow = styled('tr')`
    font-weight: ${props => (props.read ? 400 : 700)};
    cursor: pointer;
    :hover {
        background-color: #eee;
    }
`;

const TableCell = styled('td')`
    font-size: ${props => (props.small ? '0.75em' : '1em')};
    min-width: ${props => props.small && '101px'};
`;

export class MessageRowItem extends React.Component {
    state = { showModal: false };

    showModal = () => {
        this.setState({
            showModal: true,
        });

        if (!this.props.message.readAt) {
            this.props.onMarkAsRead({ id: this.props.message.id });
        }
    };

    hideModal = () => {
        this.setState({
            showModal: false,
        });
    };

    render() {
        const { message } = this.props;
        const dateString = message.createdAt ? message.createdAt.replace(/-/g, '/') : null;
        const date = new Date(dateString).toDateString();
        const readDateString = message.readAt ? message.readAt.replace(/-/g, '/') : null;
        const readDate = new Date(readDateString).toDateString();

        return (
            <React.Fragment>
                <TableRow onClick={this.showModal} read={!!message.readAt}>
                    <TableCell small>{date}</TableCell>
                    <TableCell>
                        <a href="#">Click here to see secure message</a>
                    </TableCell>
                    <TableCell small>{message.readAt ? readDate : ''}</TableCell>
                </TableRow>
                <MessageDetailModal
                    isOpen={this.state.showModal}
                    toggle={this.hideModal}
                    message={message}
                />
            </React.Fragment>
        );
    }
}
