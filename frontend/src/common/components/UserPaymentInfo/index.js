//import liraries
import React, { useState, useEffect } from 'react';
import { paymentsService } from 'src/rootService';
import styled from 'react-emotion';
import { colors, fontFamily } from 'src/variables';
import { Col, Row } from 'reactstrap';
import { cardIcons, cardsKeyIconMapping } from 'src/features/dashboard/constants/paymentMethodsContent';
import moment from 'moment';


export const UserPaymentInfo = (props) => {

  const { user, paymentDetails } = props;
  const [loaded, setLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [paymentMethods, setPaymentMethods] = useState([])

  const CardItemWrapper = styled.div`
    background: rgba(247, 224, 217, 0.3);
    border-radius: 4px;
    padding: 12px;
  `

  const Text = styled.div`
    font-family: ${fontFamily.baseFont};
    font-size: 14px;
    line-height: 17px;
    color: ${colors.black};
  `

  useEffect(() => {
    let isMounted = true;
    if (paymentDetails){
      const paymentMethod = {'card': paymentDetails};
      setPaymentMethods([paymentMethod]);
      setLoaded(true);
    }
    else if (user.paymentProcessorCustomerId) {
      const getPaymentsDetails = async () => {
        await paymentsService.getCustomerDefaultPaymentMethod(user.id)
        .then(response => {
          if (response && isMounted) {
            setPaymentMethods(response);
          }
        })
        .catch(err => {
          if (isMounted) {
            setErrorMessage("Error loading payment methods");
            setLoaded(false);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoaded(true);
          }
        })
      }
      getPaymentsDetails();
    }
    return () => {
      isMounted = false;
    };
  }, [props.user.paymentProcessorCustomerId, paymentDetails])

  const cardDetails = (paymentMethod) => {
    const brand = paymentMethod.card && paymentMethod.card.brand ? paymentMethod.card.brand.split(' ').join('').toLowerCase() : null;
    const cardIcon = cardsKeyIconMapping[brand]

    return (
      <CardItemWrapper key={paymentMethod.card.last4}>
        <Row>
          <Col xs={8}>
            <Text>{user.firstName} {user.lastName}</Text>
            <Text>**** **** **** {paymentMethod.card.last4}</Text>
          </Col>
          <Col style={{
            textAlign: "right",
            margin: 'auto'
          }}>
            {cardIcon ?
              <img style={{ height: '1.8rem', width: '3rem' }} src={cardIcon} />
              : <Text>{brand}</Text>}
          </Col>
        </Row>
      </CardItemWrapper>
    )
  }

  const checkExpDate = ({ card }) => {
    const currentDate = moment()
    const cardExpDate = moment(`${card.expYear}-${card.expMonth}-01`, 'YYYY-MM-DD')
    if (currentDate.isAfter(cardExpDate)) {
      if (!errorMessage) {
        setErrorMessage(`Your credit card has expired. Please update your credit card information!`)
      }
    }
  }

  if (!loaded) {
    let loadingText = 'Loading payment details...'
    if (!paymentDetails || (user && !user.paymentProcessorCustomerId)) {
      loadingText = 'No payment saved'
    }

    return (
      <div className="text-center" style={{ fontSize: 16 }}>
        {loadingText}
      </div>
    )
  }

  return (
    <div>
      {paymentMethods.length > 0 && loaded && (
          <div>
            <div>
              {!errorMessage && !props.hideTitle && (<Text style={{ marginBottom: 7 }}>Current card</Text>)}
            </div>
            <div>
              {paymentMethods.map(paymentMethod => {
                checkExpDate(paymentMethod)
                return cardDetails(paymentMethod)
              })}
            </div>
          </div>
      )}
      {paymentMethods.length === 0 && loaded && !errorMessage && (
        <div className="text-center" style={{ fontSize: 16 }}>
          No valid payment method found
        </div>
      )}
      <div>
        {errorMessage && (<div style={{ fontSize: 16, color: colors.mulberry }}>{errorMessage}</div>)}
      </div>
    </div>
  );
};
