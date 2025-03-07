import React from 'react';
import styled from 'react-emotion';
import LazyLoad from 'react-lazyload';
import { Container, Row, Col } from 'reactstrap';
import _ from 'lodash';
import { StandardBlueButton, StandardBlueButtonHref } from 'src/common/components/Buttons';
import { fontFamily, fontWeight } from 'src/variables';

const acneImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-acne.png';
const pigmentationImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-pigmentation.png';
const poresImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-pores.png';
const roughSkinImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-rough-skin.png';
const wrinklesImg = 'https://d17yyftwrkmnyz.cloudfront.net/science-wrinkles.png';

const Wrapper = styled('div')`
    background: #fff;
		padding: 0px 0px 40px 0px;
    @media (max-width: 768px) {
    }
`;

const TitleWrapper = styled('div')`
    text-align: left;

    @media (min-width: 768px) {
        text-align: center;
    }
`;

const ScrienceImageWrapper = styled('div')`
    text-align: center;

    img {
        width: 320px;
        margin: auto;
        @media (max-width: 768px) {
						margin-bottom: 25px;
				}
    }
`;

const ScienceWrapper = styled('div')`
    max-width: 800px;
    margin: auto;
    margin-top: 5px;
`;

const ScienceInner = styled('div')`
    margin-top: 10px;
    @media (min-width: 768px) {
        max-width: 352px;
        margin: auto;
        margin-bottom: 80px;
    }
`;

const ScienceContent = styled('div')`
    h2 {
        margin-bottom: 15px;
    }
    p {
        & ~ p {
            margin-top: 30px;
        }
    }
`;

const BtnWrap = styled('div')`
    text-align: left;
    margin-top: 50px;
`;

const Heading2 = styled('h2')`
    font-size: 28px;
    line-height: 32px;
    letter-spacing: 0.2px;
	font-family: ${fontFamily.baseFont};
	font-weight: ${fontWeight.bold};
    -webkit-font-smoothing: 'antialiased';
    text-align:center;
    margin:0 auto;
    margin-bottom: 50px;

    @media (max-width: 768px) {
				margin-bottom: 20px;
		}
`;

const Heading3 = styled('h3')`
	font-family: ${fontFamily.baseFont};
	font-weight: ${fontWeight.bold};
    font-size: 22px;
    color: #000000;
    letter-spacing: 0;
    line-height: 24px;
`;

const PrimaryButtonContainer = styled('div')`
    text-align: center;
    margin-top: 40px;
    @media (min-width: 768px) {
        text-align: left;
    }
`;

const PrimaryButton = styled('button')`
    color: #fff;
    background-color: rgba(69, 119, 219, 1);
    border-color: rgba(69, 119, 219, 1);
    border-radius: 0;
    outline: 0;
    font-size: 17px;
    font-weight: bold;
    border-width: 2px;
    min-height: 45px;
    line-height: 25px;
    padding: 8px 30px;
    cursor: pointer;
	font-family: ${fontFamily.baseFont};
    &:hover {
        color: #000;
        background-color: transparent;
        border-color: #000;
    }
    &:focus {
        box-shadow: none;
        outline: 0;
    }
    &:active {
        color: #000 !important;
        background-color: transparent !important;
        border-color: #000 !important;
    }
    &.uppercase {
        text-transform: uppercase;
    }
`;

const ProductPagePrimaryButton = styled('a')`
    text-decoration: none;
    color: #fff;
    background-color: rgba(69, 119, 219, 1);
    border-color: rgba(69, 119, 219, 1);
    border-radius: 0;
    outline: 0;
    font-size: 17px;
    font-weight: bold;
    border-width: 2px;
    min-height: 45px;
    line-height: 25px;
    padding: 12px 30px;
    cursor: pointer;
	font-family: ${fontFamily.baseFont};
    &:hover {
        color: #000;
        background-color: transparent;
        border-color: #000;
    }
    &:focus {
        box-shadow: none;
        outline: 0;
    }
    &:active {
        color: #000 !important;
        background-color: transparent !important;
        border-color: #000 !important;
    }
    &.uppercase {
        text-transform: uppercase;
    }
`;

export class ScienceOfRetinoidsB extends React.Component {
	render() {
		return (
			<Wrapper>
				<Container>
					<TitleWrapper>
						<React.Fragment>
							<ScienceWrapper>
								<Heading2 bold>Over 50 years of research prove retinoids work</Heading2>
							</ScienceWrapper>
						</React.Fragment>
					</TitleWrapper>
					<ScienceWrapper>
						<Row>
							<Col md={6}>
								<ScienceInner>
									<ScienceContent>
										<React.Fragment>
											<Heading3>Wrinkles</Heading3>
											<p>
												Stimulates the production of collagen, improving the appearance of wrinkles and fine lines.
											</p>
										</React.Fragment>
									</ScienceContent>
									<ScrienceImageWrapper>
										<LazyLoad offset={30} once>
											<img src={wrinklesImg} />
										</LazyLoad>
									</ScrienceImageWrapper>
								</ScienceInner>
								<ScienceInner>
									<ScienceContent>
										<React.Fragment>
											<Heading3>Pores</Heading3>
											<p>
												Clears cellular debris around enlarged pores, making them appear smaller.
											</p>
										</React.Fragment>
									</ScienceContent>
									<ScrienceImageWrapper>
										<LazyLoad offset={30} once>
											<img src={poresImg} />
										</LazyLoad>
									</ScrienceImageWrapper>
								</ScienceInner>
								<ScienceInner>
									<ScienceContent>
										<React.Fragment>
											<Heading3>Pigmentation</Heading3>
											<p>
												Improves pigmentation of freckles, melasma, sun spots and dark spots by dispersing melanin granules.
											</p>
										</React.Fragment>
									</ScienceContent>
									<ScrienceImageWrapper>
										<LazyLoad offset={30} once>
											<img src={pigmentationImg} />
										</LazyLoad>
									</ScrienceImageWrapper>
								</ScienceInner>
							</Col>
							<Col md={6}>
								<ScienceInner>
									<ScienceContent>
										<React.Fragment>
											<Heading3>Acne</Heading3>
											<p>
												Decreases comedones and their precursor, thereby decreasing noninflammatory and inflammatory acne.
											</p>
										</React.Fragment>
									</ScienceContent>
									<ScrienceImageWrapper>
										<LazyLoad offset={30} once>
											<img src={acneImg} />
										</LazyLoad>
									</ScrienceImageWrapper>
								</ScienceInner>

								<ScienceInner>
									<ScienceContent>
										<React.Fragment>
											<Heading3>Rough Skin</Heading3>
											<p>
												Improves roughness by reducing the layer of dead skin cells and increasing glycosoaminoglycan (GAG).
											</p>
										</React.Fragment>
									</ScienceContent>
									<ScrienceImageWrapper>
										<LazyLoad offset={30} once>
											<img src={roughSkinImg} />
										</LazyLoad>
									</ScrienceImageWrapper>
									{this.props.isHomepage ? (
										<BtnWrap>
											<StandardBlueButton
												active={true}
												onClick={_.partial(
													this.props.goToProduct,
													'science',
												)}
											>
												Buy retinoid
											</StandardBlueButton>
										</BtnWrap>
									) : (
											<PrimaryButtonContainer>
												<StandardBlueButtonHref active={true} href="#">Buy now</StandardBlueButtonHref>
											</PrimaryButtonContainer>
										)}
								</ScienceInner>
							</Col>
						</Row>
					</ScienceWrapper>
				</Container>
			</Wrapper>
		);
	}
}
