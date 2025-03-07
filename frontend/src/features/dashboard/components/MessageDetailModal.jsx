import React from 'react';
import styled, { css } from 'react-emotion';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { breakpoints } from 'src/variables';

const ModalStyles = css`
    display: flex;
    font-size: 14px;
    padding-top: 100px;

    ${breakpoints.md} {
        width: 850px !important;
        max-width: 850px !important;
    }
    ${breakpoints.sm} {
        width: 350px !important;
        max-width: 350px !important;
    }

    .modal-title {
        font-size: 20px;
    }

    .form-group {
        width: 100%;
    }

    .form-control {
        font-size: 14px;
    }

    input {
        height: 25px;
        min-height: initial;
    }

    textarea.form-control {
        height: 100px;
    }

    button {
        font-size: inherit;
    }
`;

const MessageContainer = styled('div')`
    white-space: pre-wrap;
    font-size: 1rem;
`;

export const MessageDetailModal = ({ message, isOpen, toggle }) => (
    <Modal isOpen={isOpen} toggle={toggle} className={ModalStyles}>
        <ModalHeader toggle={toggle}>Message</ModalHeader>
        <ModalBody>
            <MessageContainer>{message.body}</MessageContainer>
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" onClick={toggle}>
                Close
            </Button>
        </ModalFooter>
    </Modal>
);
