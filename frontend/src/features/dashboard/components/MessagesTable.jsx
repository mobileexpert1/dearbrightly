import React from 'react';
import Table from 'reactstrap/lib/Table';

import { MessageRowItem } from './MessageRowItem';

export const MessagesTable = props => (
    <Table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Message</th>
                <th>Read at</th>
            </tr>
        </thead>
        <tbody>
            {props.messages.map((item, index) => (
                <MessageRowItem key={index} message={item} onMarkAsRead={props.onMarkAsRead} />
            ))}
        </tbody>
    </Table>
);
