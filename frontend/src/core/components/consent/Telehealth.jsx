import React, { Component } from 'react';
import styled from "@emotion/styled"
import { Container, Row, Col } from 'reactstrap';
import scrollToComponent from 'react-scroll-to-component';

import { fontSize, fontFamily, fontWeight } from 'src/variables';

const ConsentWrapper = styled('div')`
    margin-top: 10px;
    max-height: 50vh;
    overflow-y: auto;
    border: 1px solid #dedede;
    padding: 15px 25px;
    @media (max-width: 768px) {
        padding: 10px 20px;
    }
`;

const ConsentHeader = styled('div')`
    margin-top: 10px;
    margin-bottom: 10px;
`;

const Title = styled('h2')`
    font-family: ${fontFamily.baseFont};
    font-size: 24px;
    line-height: 24px;
    letter-spacing: 0.08px;
    text-align: left;
`;

const SubTitle = styled('h3')`
    font-size: ${fontSize.normal};
    margin-top: 25px;
    margin-bottom: 10px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
`;

const Text = styled('p')`
    font-size: ${fontSize.small};
    letter-spacing: 0.4px;
    color: #050000;
`;

const Info = styled('p')`
    font-size: 14px;
    letter-spacing: 0.6px;
    color: #050000;
    margin-bottom: 20px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
`;

const List = styled('ul')`
    list-style-type: circle;
    margin-left: 10px;
`;

const ListItem = styled('li')`
    font-size: ${fontSize.small};
    letter-spacing: 0.4px;
    color: #050000;
    font-family: ${fontFamily.baseFont};
`;

const ButtonContainer = styled('div')`
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 20px;
`;

const Button = styled('button')`
    color: #fff;
    border-radius: 0;
    font-size: 17px;
    font-weight: bold;
    border: 2px solid transparent;
    min-height: 45px;
    line-height: 25px;
    padding: 8px 30px;
    font-family: ${fontFamily.baseFont};
    background-color: #000;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s;
    & + button {
        margin-left: 20px;
    }
    &:hover {
        color: #000;
        background-color: transparent;
        border: 2px solid #000;
        text-decoration: none;
    }
    &:focus {
        box-shadow: none;
        outline: none;
    }
`;

const BackBtn = styled.a`
    color: #fff;
    border-radius: 0;
    font-size: 17px;
    font-weight: bold;
    border: 2px solid transparent;
    min-height: 45px;
    line-height: 25px;
    padding: 8px 30px;
    margin-left: 10px;
    font-family: ${fontFamily.baseFont};
    background-color: #000;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s;
    & + button {
        margin-left: 20px;
    }
    &:hover {
        color: #000;
        background-color: transparent;
        border: 2px solid #000;
        text-decoration: none;
    }
    &:focus {
        box-shadow: none;
        outline: none;
    }
`

export default class Telehealth extends Component {
    constructor(props) {
        super(props);
        this.printTarget = React.createRef();
    }

    componentDidMount() {
        setTimeout(() => {
            scrollToComponent(this.componentTop, { offset: -100, align: 'top' });
        }, 1000);
    }

    onPrint = () => {
        const printContents = this.printTarget.current;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents.innerHTML;
        window.print(this.printTarget);
        document.body.innerHTML = originalContents;
    };

    

    render() {

        return (
            <Container>
                <img src="https://tapjoy.go2cloud.org/SL2It" width="1" height="1" />
                <ConsentHeader
                    ref={section => {
                        this.componentTop = section;
                    }}
                >
                </ConsentHeader>
                <ConsentWrapper>
                    <Row>
                        <Col>
                            <Info>Last updated on May 22, 2020</Info>
                            <div ref={this.printTarget}>
                                <Text>
                                    Our telehealth service is currently available in certain states. You
                                    agree to use our service only if you are currently in one of
                                    these states. You are consenting to receive telehealth
                                    services from independent and licensed providers ('Provider').
                                </Text>
                                <Text>
                                    This form ('Consent to Telehealth') provides you with
                                    information about telehealth. Only use our service if you have
                                    carefully reviewed the information contained in this form and
                                    have subsequently made an informed decision that our service is
                                    right for you. Use of our services constitutes your review and
                                    acknowledgement of the information contained in this form and
                                    your informed consent to participate in telehealth health
                                    services as part of your medical care. If you have any
                                    questions, please send us a message using the Dear Brightly
                                    mobile application or website (collectively 'Dear Brightly') or
                                    call us at (415) 906-5937.
                                </Text>
                                <Text>
                                    THIS SERVICE IS NOT INTENDED FOR EMERGENCIES. IF YOU ARE HAVING
                                    A MEDICAL EMERGENCY, PLEASE CALL 911 OR SEEK IMMEDIATE IN PERSON
                                    MEDICAL ATTENTION.
                                </Text>

                                <SubTitle>Agreement</SubTitle>
                                <Text>
                                    Usage of our service requires that you carefully review,
                                    acknowledge, and agree to this Consent to Telehealth, as well as
                                    the information contained in our Terms and Conditions,
                                    Privacy Policy, and Notice of Privacy Practices forms, including
                                    the following:
                                </Text>
                                <List>
                                    <ListItem>
                                        Telehealth is a healthcare provider's use of electronic
                                        information and communication technologies to deliver
                                        services to an individual who is located at a different site
                                        than the provider, but within one of the States listed
                                        above.
                                    </ListItem>
                                    <ListItem>
                                        You understand that you need to provide a full and accurate
                                        medical history, including but not limited to any
                                        pre-existing conditions, to your telehealth provider so
                                        that your provider can determine what services you may need,
                                        if any.
                                    </ListItem>
                                    <ListItem>
                                        You further understand that your provider may determine that
                                        telehealth is not appropriate for you at this time based
                                        on details of your case, the condition being diagnosed or
                                        treated, or both.
                                    </ListItem>
                                    <ListItem>
                                        You understand that the results of medical treatment by any
                                        doctor or healthcare professional cannot be guaranteed.
                                    </ListItem>
                                    <ListItem>
                                        You further understand that you have the right to object to
                                        the use of a telehealth service without prejudice to any
                                        future care or treatment, and without risking the loss or
                                        withdrawal of any health benefits to which you are entitled.
                                    </ListItem>
                                    <ListItem>
                                        You understand that the laws that protect privacy and the
                                        confidentiality of medical information also apply to
                                        telehealth.
                                    </ListItem>
                                    <ListItem>
                                        You have the right to inspect and obtain copies of all
                                        information received and recorded during any telehealth
                                        session, subject to the policies detailed in the Notice of
                                        Privacy Practices.
                                    </ListItem>
                                    <ListItem>
                                        You agree that you have read and understand the information
                                        contained in this Consent to Telehealth.
                                    </ListItem>
                                    <ListItem>
                                        You consent to allow the Provider to provide telehealth
                                        services to you.
                                    </ListItem>
                                </List>

                                <SubTitle>Nature of Telehealth</SubTitle>
                                <Text>
                                    Telehealth involves the use of electronic communication
                                    between a health care provider and a patient to exchange medical
                                    information for the purpose of the evaluation, diagnosis,
                                    consultation, and/or treatment of the patient. In this way,
                                    telehealth allows the patient and provider to establish a
                                    relationship, much as they would during a traditional in-person
                                    appointment. In addition to electronic communication, your
                                    telehealth program may also include: recorded audio
                                    communications, physical examinations, medical imaging, and
                                    medical tests. It may also include related technologies such as
                                    'store-and-forward,' which allows for asynchronous medical care
                                    and means that the doctor's review of your information may occur
                                    significantly aster submission, as opposed to real time review.
                                </Text>

                                <SubTitle>Benefits</SubTitle>
                                <Text>
                                    The benefits of telehealth include more convenient access to
                                    medical services and care, including the expertise of
                                    specialists and consultants that may not otherwise be available
                                    to you. Telehealth also permits increased efficiency in
                                    evaluations, diagnoses, consultations, and treatment.
                                </Text>

                                <SubTitle>Potential Risks</SubTitle>
                                <Text>
                                    The potential risks associated with the use of telehealth
                                    include: delays in medical evaluation and treatment due to
                                    equipment failures or information transmission deficiencies
                                    (such as poor image resolution), breach of privacy of protected
                                    health information due to security breaches or failures, and
                                    errors due to patient’s failure to provide complete medical
                                    information or records (such as adverse drug interactions,
                                    allergic reactions, or complications). The possibility of
                                    asynchronous care may also create risks due to a delay in
                                    evaluation, diagnosis, and medical care.
                                </Text>

                                <SubTitle>Alternatives</SubTitle>
                                <Text>
                                    Alternative methods of care, such as traditional in-person
                                    medical services, may be also available to you. Your provider
                                    will explain any such options to you, and you may choose
                                    alternative services at any time. Some services may be more or
                                    less effective than what we provide; some treatments and care
                                    strategies may also require an in-person exam or procedure,
                                    which we do not provide.
                                </Text>

                                <SubTitle>Follow-Up Care</SubTitle>
                                <Text>
                                    In some situations telehealth is not an appropriate method of
                                    follow-up care. If you have an adverse reaction, if a technical
                                    failure prevents you from communicating with your telehealth
                                    provider, or if telehealth cannot provide sufficient follow-up
                                    care for your condition, then you should seek in-person care or,
                                    in an emergency, contact 911.
                                </Text>

                                <SubTitle>Emergency Situations</SubTitle>
                                <Text>
                                    If there is an urgent or emergency situation telehealth is not
                                    an appropriate method of care.
                                </Text>
                                <Text>
                                    IN CASE OF AN EMERGENCY, YOU SHOULD SEEK IMMEDIATE MEDICAL
                                    ATTENTION OR EMERGENCY CARE BY CALLING 911.
                                </Text>

                                <SubTitle>Privacy Rights</SubTitle>
                                <Text>
                                    The Provider uses network and software security protocols to
                                    protect the confidentiality of your patient health information,
                                    including your medical record, electronic medical records,
                                    imaging, and personal financial data. These protocols are
                                    designed to safeguard the data and to ensure its integrity
                                    against corruption. Personal information that identifies you or
                                    contains protected health information will not be disclosed to
                                    any third party without your consent, except as authorized by
                                    law for the purposes of consultation, treatment,
                                    payment/billing, and certain administrative purposes, or as
                                    otherwise set forth in the Provider's Notice of Privacy
                                    Practices.
                                </Text>

                                <SubTitle>Indemnification</SubTitle>
                                <Text>
                                    YOU AGREE TO INDEMNIFY AND HOLD HARMLESS THE PROVIDER, ITS
                                    EMPLOYEES, AGENTS, DIRECTORS, MEMBERS, MANAGERS, SHAREHOLDERS,
                                    OFFICERS, REPRESENTATIVES, ASSIGNS, PARENTS, PREDECESSORS, AND
                                    SUCCESSORS FROM AND AGAINST ANY AND ALL LOSS OR DAMAGE,
                                    INCLUDING ANY AND ALL INDIRECT, INCIDENTAL, SPECIAL,
                                    CONSEQUENTIAL OR EXEMPLARY DAMAGES, EXPENSES, LIABILITIES,
                                    CLAIMS, OR DEMANDS WHATSOEVER ARISING OUT OF OR RELATED TO ANY
                                    FAILURE OF TECHNOLOGY OR EQUIPMENT IN CONNECTION WITH THE
                                    PROVISION OF TELEMEDICINE, WHETHER OR NOT ANY SUCH LOSS, DAMAGE,
                                    EXPENSE, LIABILITY, CLAIM, OR DEMAND ARISES FROM OR RELATES TO
                                    THE PROVIDER'S NEGLIGENCE.
                                </Text>

                                <Title>Notice of Privacy Practices</Title>
                                <Info>Last Updated on February 11, 2020</Info>
                                <SubTitle>Dear Brightly’s Commitment to Your Privacy</SubTitle>
                                <Text>
                                    Please carefully review this notice. It contains important
                                    information about the ways in which medical information about
                                    you may be collected, used, and disclosed, and how you can
                                    obtain access to this information. Dear Brightly is dedicated to
                                    maintaining the privacy of your protected health information
                                    ('PHI'). PHI is information about you that may be used to
                                    identify you (such as your name, social security number, or
                                    address), and that relates to your past, present, or future:
                                    physical or mental health or condition, your treatment, and your
                                    payment for such treatment. In conducting its business, Dear
                                    Brightly will receive and create records containing your PHI.
                                    Dear Brightly is required by law to maintain the privacy of your
                                    PHI and to provide you with notice of its legal duties and
                                    privacy practices with respect to your PHI.
                                </Text>
                                <Text>
                                    Dear Brightly must abide by the terms of this notice while it is
                                    in effect. This current notice takes effect on December 16,
                                    2017, and will remain in effect until Dear Brightly replaces it.
                                    Dear Brightly reserves the right to change the terms of this
                                    notice at any time, as long as the changes are in compliance
                                    with applicable law. If Dear Brightly changes the terms of this
                                    notice, the new terms will apply to all PHI that it maintains,
                                    including PHI that was created or received before such changes
                                    were made. Dear Brightly will also post any such changes on its
                                    website and mobile application, and will also make the new
                                    notice available upon request.
                                </Text>

                                <SubTitle>Uses and Disclosures of PHI</SubTitle>
                                <Text>
                                    Dear Brightly may use and disclose your PHI in the following
                                    ways:
                                </Text>
                                <List>
                                    <ListItem>
                                        <strong>Treatment and Healthcare Operations:</strong> Dear
                                        Brightly is permitted to disclose your PHI for purposes of
                                        your treatment, for example, to physicians or healthcare
                                        providers in connection with your visit or evaluation or
                                        with the provision of follow-up treatment.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Treatment and Healthcare Operations:</strong> Dear
                                        Brightly may use your PHI in connection with its healthcare
                                        operations, such as providing customer services and
                                        conducting quality review assessments.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Treatment and Healthcare Operations:</strong> Dear
                                        Brightly may engage third parties to provide various
                                        services for Dear Brightly. If any such third party must
                                        have access to your PHI in order to perform its services,
                                        Dear Brightly will require that third party to enter an
                                        agreement that binds the third party to the use and
                                        disclosure restrictions required by law and outlined in this
                                        notice.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Authorization:</strong> You may authorize Dear
                                        Brightly to use and disclose your PHI, provided that your
                                        authorization is in writing and that the extent such use or
                                        disclosure is consistent with your authorization. You may
                                        revoke your written authorization at any time.
                                    </ListItem>
                                    <ListItem>
                                        <strong>As Required by Law:</strong> Dear Brightly may use
                                        and disclose your PHI as required by law.
                                    </ListItem>
                                </List>

                                <SubTitle>Special Circumstances</SubTitle>
                                <Text>
                                    The following categories describe unique circumstances in which
                                    Dear Brightly may use or disclose your PHI:
                                </Text>
                                <List>
                                    <ListItem>
                                        <strong>Public Health Activities:</strong> Dear Brightly may
                                        disclose your PHI to public health or other governmental
                                        authorities to aid in the preventing and controlling
                                        disease, reporting child abuse or neglect, reporting
                                        domestic violence, and reporting the quality, safety, and
                                        effectiveness of a regulated product or activity to the Food
                                        and Drug Administration. Dear Brightly may also, in certain
                                        circumstances, disclose you PHI to persons who have been
                                        exposed to a communicable disease or may otherwise be at
                                        risk of contracting or spreading a disease or condition.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Workers’ Compensation:</strong> Dear Brightly may
                                        disclose your PHI as authorized by, and to the extent
                                        necessary to comply with, workers’ compensation programs and
                                        other similar programs relating to work-related illnesses or
                                        injuries.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Health Oversight Activities:</strong> Dear Brightly
                                        may disclose your PHI to a health oversight agency for
                                        authorized activities such as audits, investigations,
                                        inspections, and licensing and disciplinary actions relating
                                        to the healthcare system or government benefit programs.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Judicial and Administrative Proceedings:</strong>{' '}
                                        Dear Brightly may disclose your PHI, in certain
                                        circumstances, as permitted by applicable law, in response
                                        to an order from a court or administrative agency, or in
                                        response to a subpoena or discovery request.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Law Enforcement.</strong> Dear Brightly may, in
                                        certain circumstances, disclose your PHI to a law
                                        enforcement agency or official. Such circumstances include
                                        but are not limited to identifying or locating a suspect,
                                        fugitive, material witness, or missing person.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Decedents:</strong> Dear Brightly may, in certain
                                        circumstances, disclose your PHI to coroners, medical
                                        examiners, and funeral directors to assist in body
                                        identification, determining the cause of death, and
                                        fulfilling duties relating to decedents.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Organ Procurement:</strong> Dear Brightly may, in
                                        certain circumstances, use or disclose PHI as necessary to
                                        facilitate organ donation and transplantation.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Research:</strong> Dear Brightly may, in certain
                                        circumstances, use or disclose your PHI that is necessary
                                        for research purposes.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Threat to Health or Safety:</strong> Dear Brightly
                                        may, under certain circumstances, use or disclose your PHI
                                        if necessary to prevent or lessen a serious and imminent
                                        threat to the health or safety of a specific person or the
                                        public at large.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Specialized Government Functions:</strong> Dear
                                        Brightly may, in certain situations, use and disclose the
                                        PHI of persons who are, or were, in the Armed Forces for
                                        purposes such as ensuring proper execution of a military
                                        mission or determining entitlement to benefits. Dear
                                        Brightly may also disclose PHI to federal officials for
                                        intelligence and national security purposes.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Marketing:</strong> We may use or disclose your
                                        medical information to send you treatment or healthcare
                                        operations communications concerning treatment alternatives
                                        or other health- related products or services.
                                    </ListItem>
                                </List>

                                <SubTitle>Your Rights Regarding Your PHI</SubTitle>
                                <Text>
                                    You have the following rights regarding the PHI maintained by
                                    Dear Brightly:
                                </Text>
                                <List>
                                    <ListItem>
                                        <strong>Confidential Communication:</strong> You have the
                                        right to receive confidential communications containing your
                                        PHI. You may request that Dear Brightly communicate with you
                                        through alternate means or at an alternate location, and
                                        Dear Brightly will accommodate your reasonable requests. You
                                        must submit your request in writing to Dear Brightly.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Restrictions:</strong> You have the right to request
                                        restrictions on certain uses and disclosures of PHI for
                                        treatment, payment, or healthcare operations. You also have
                                        the right to request that Dear Brightly restrict its
                                        disclosures of PHI to only certain individuals involved in
                                        your care or the payment of your care. You must submit your
                                        request in writing to Dear Brightly. Dear Brightly is not
                                        required to comply with your request. However, if Dear
                                        Brightly agrees to comply with your request, it will be
                                        bound by such agreement, except when otherwise required by
                                        law or in the event of an emergency.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Inspection and Copies:</strong> You have the right
                                        to inspect and copy your PHI. You must submit your request
                                        in writing to Dear Brightly. Dear Brightly may impose a fee
                                        for the costs of copying, mailing, and labor and supplies
                                        associated with your request. Dear Brightly may deny your
                                        request to inspect and/or copy your PHI in certain limited
                                        circumstances. In such an event, Dear Brightly will inform
                                        you of the reason for the denial, and you may request a
                                        review of the denial.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Amendment:</strong> You have a right to request that
                                        Dear Brightly amend your PHI if you believe it is incorrect
                                        or incomplete, and you may request an amendment for as long
                                        as the information is maintained by Dear Brightly. You must
                                        submit your request in writing to Dear Brightly and provide
                                        a reason to support the requested amendment. Dear Brightly
                                        may, under certain circumstances, deny your request, will
                                        send you a written notice of denial. If Dear Brightly denies
                                        your request, you will be permitted to submit a statement of
                                        disagreement for inclusion in your records.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Accounting of Disclosures:</strong> You have a right
                                        to receive an accounting of all disclosures Dear Brightly
                                        has made of your PHI. However, that right does not include
                                        disclosures made for treatment, payment, or healthcare
                                        operations, disclosures made to you about your treatment,
                                        disclosures made pursuant to an authorization, and certain
                                        other disclosures. You must submit your request in writing
                                        to Dear Brightly and you must specify the time period
                                        involved (which must be for a period of time of less than
                                        six years from the date of the disclosure). Your first
                                        accounting will be free of charge. However, Dear Brightly
                                        may charge you for the costs involved in fulfilling any
                                        additional request made within a period of 12 months. Dear
                                        Brightly will inform you of such costs in advance so that
                                        you may withdraw or modify your request accordingly.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Breach Notification:</strong> You have the right to
                                        be notified in the event that Dear Brightly (or a Dear
                                        Brightly business associate) discovers a breach of unsecured
                                        PHI.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Paper Copy:</strong> You have the right to obtain a
                                        paper copy of this notice from Dear Brightly at any time
                                        upon request. To obtain a paper copy of this notice, please
                                        contact Dear Brightly via email at support@dearbrightly.com.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Complaint:</strong> You may complain to Dear
                                        Brightly and to the California Department of Public Health
                                        if you believe that your privacy rights have been violated.
                                        To file a complaint with Dear Brightly, you must submit a
                                        statement in writing to Dear Brightly either via email at
                                        support@dearbrightly.com or by standard mail at PO Box 3781,
                                        Oakland, CA 94609. Dear Brightly will
                                        not retaliate against you for filing a complaint.
                                    </ListItem>
                                    <ListItem>
                                        <strong>Further Information:</strong> If you would like
                                        additional information about your privacy rights, please
                                        contact Dear Brightly at support@dearbrightly.com or by
                                        calling Dear Brightly at (415) 906-5937 and asking to speak
                                        to the Chief Information Security Officer. To the extent you
                                        are required to send a written request to Dear Brightly to
                                        exercise any right described in this notice, you must submit
                                        your written request to Dear Brightly at: PO Box 3781,
                                        Oakland, CA 94609.
                                    </ListItem>
                                </List>
                            </div>
                        </Col>
                    </Row>
                </ConsentWrapper>
                <Row className="justify-content-center align-items-center">
                    <ButtonContainer>
                        <Button onClick={this.onPrint}>Print</Button>
                    </ButtonContainer>
                </Row>
            </Container>
        );
    }
}