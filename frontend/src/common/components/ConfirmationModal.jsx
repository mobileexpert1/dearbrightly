import React from 'react';
import styled from 'react-emotion';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { colors } from 'src/variables';

const AlertMessage = styled.p`
    font-size: 14px;
    margin: 0;
`;

export const ConfirmationModal = ({
    isOpen,
    toggle,
    header,
    message,
    confirmButtonText,
    onConfirm,
    confirmBtnColor
}) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>{header}</ModalHeader>
        <ModalBody>
            <AlertMessage>{message}</AlertMessage>
        </ModalBody>
        <ModalFooter>
            <Row>
                <Col xs={12} md={6} sm={12} lg={6} xl={6}></Col>
                <Col xs={12} md={6} sm={12} lg={6} xl={6}>
                    <Row>
                        <Col xs={6}>
                            <Button className="btn-block" color="secondary" onClick={toggle}>
                                Cancel
                            </Button>
                        </Col>
                        <Col xs={6}>
                            <Button
                                className="btn-block" 
                                style={{
                                    background: confirmBtnColor || colors.red
                                }}
                                onClick={() => {
                                    onConfirm();
                                    toggle();
                                }}
                            >
                                {confirmButtonText}
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </ModalFooter>
    </Modal>
);
