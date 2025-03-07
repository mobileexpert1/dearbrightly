import React from 'react';
import styled from 'react-emotion';
import { Container } from 'reactstrap';
import { fontFamily, fontWeight } from 'src/variables';

const alarmIcon = 'https://d17yyftwrkmnyz.cloudfront.net/icon-alarm.png';
const doctorIcon = 'https://d17yyftwrkmnyz.cloudfront.net/icon-doctor.png';
const insuranceIcon = 'https://d17yyftwrkmnyz.cloudfront.net/icon-insurance.png';
const searchIcon = 'https://d17yyftwrkmnyz.cloudfront.net/icon-search.png';

const Wrapper = styled('div')`
		@media (min-width: 768px) {
        padding: 0px 0px 100px 0px;
    }
    position: relative;
    .about-deliver-block {
        background: rgb(250, 248, 247);
        padding: 50px 20px 0px 20px;
        @media (min-width: 768px) {
            margin: 30px 80px 0px 80px;
        }
    }
`;

const H4MediumBold = styled('h4')`
    font-size: 28px;
    line-height: 29px;
    color: rgb(193, 86, 129);
    letter-spacing: 0.1px;
    font-family: ${fontFamily.baseFont};
    font-weight: ${fontWeight.bold};
    @media (min-width: 768px) {
        max-width: 352px;
        margin: auto;
    }
    padding-bottom: 10px;
`;

const H4Medium = styled('h4')`
    font-size: 18px;
    line-height: 20px;
    color: #808080;
    letter-spacing: 0.1px;
    font-family: ${fontFamily.baseFont};
    @media (min-width: 768px) {
        max-width: 352px;
        margin: auto;
    }
`;


const H2BiggerBold = styled('h2')`
    text-align: center;
    font-size: 36px;
    line-height: 32px;
    letter-spacing: 0.2px;
    margin-bottom: 20px;
    font-family: "Roboto";
    font-weight: 700;
    -webkit-font-smoothing: 'antialiased';
    @media (min-width: 768px) {
        margin-bottom: 40px;
        font-size: 32px;
        line-height: 36px;
    }
`;

const DeliverIconSection = styled('div')`
    text-align: center;
    margin-bottom: 40px;

    @media (min-width: 768px) {
        margin-bottom: 70px;
    }

    i {
        display: inline-block;
        height: 80px;
        background-size: 100%;
        margin-bottom: 15px;

        &.icon-doctor {
            background: url(${doctorIcon}) 0 0 no-repeat;
            background-size: 100%;
            width: 68px;
        }

        &.icon-alarm {
            background: url(${alarmIcon}) 0 0 no-repeat;
            background-size: 100%;
            width: 70px;
        }
        &.icon-insurance {
            background: url(${insuranceIcon}) 0 0 no-repeat;
            background-size: 100%;
            width: 55px;
        }
        &.icon-search {
            background: url(${searchIcon}) 0 0 no-repeat;
            background-size: 100%;
            width: 70px;
        }
    }
`;

class ValueProps extends React.Component {
	render() {
		return (
			<React.Fragment>
				<Wrapper>
					<Container>
						<div className="about-deliver-block">
							<H2BiggerBold>Dear Brightly makes your life easier</H2BiggerBold>
							<div className="row">
								<div className="col-12 col-md-6">
									<DeliverIconSection>
										<i className="icon-doctor" />
										<H4MediumBold>Online doctor's consult</H4MediumBold>
										<H4Medium>
											Accessible doctors. Get a consult and if appropriate, a prescription from your board-certified doctor online. All from the comfort of your home.
										</H4Medium>
									</DeliverIconSection>
								</div>
								<div className="col-12 col-md-6">
									<DeliverIconSection>
										<i className="icon-insurance" />
										<H4MediumBold>Now <strike>$200</strike> only a $20 consult</H4MediumBold>
										<H4Medium>
											In-person dermatologist visits cost up to $200. With Dear Brightly, your online consult (once a year) is always
											$20, the price of a copay.
										</H4Medium>
									</DeliverIconSection>
								</div>
								<div className="col-12 col-md-6">
									<DeliverIconSection>
										<i className="icon-alarm" />
										<H4MediumBold>Saves time</H4MediumBold>
										<H4Medium>
											Get your consult at your convenience. No need to take work off
											or change your schedule anymore.
										</H4Medium>
									</DeliverIconSection>
								</div>
								<div className="col-12 col-md-6">
									<DeliverIconSection>
										<i className="icon-search" />
										<H4MediumBold>Clean, premium ingredients</H4MediumBold>
										<H4Medium>
											Actives: Tretinoin + Niacinamide. Retinoids are made with love
											by a preferred pharmacy that uses cruelty-free and paraben-free ingredients.
										</H4Medium>
									</DeliverIconSection>
								</div>
							</div>
						</div>
					</Container>
				</Wrapper>
			</React.Fragment>
		);
	}
}
export default ValueProps;
